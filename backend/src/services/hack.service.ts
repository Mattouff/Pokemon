import { HackModel } from '../models/hack.model';
import { BattleHackModel } from '../models/battleHack.model';
import { WeatherService } from './weather.service';
import { Pokemon } from '../types/pokemon.types';
import { WeatherCondition } from '../types/weather.types';
import { Hack, HackAttempt, SubmitHackSolutionDTO, HackResult } from '../types/hack.types';
import { NotFoundError } from '../types/errors.types';

export class HackService {
  static calculateHackProbability(
    attackerPokemons: Pokemon[],
    defenderPokemons: Pokemon[],
    weatherCondition: WeatherCondition
  ): number {
    let baseProbability = 10;
    let additionalProbability = 0;


    const allPokemons = [...attackerPokemons, ...defenderPokemons];
    
    for (const pokemon of allPokemons) {
      const weatherMultiplier = WeatherService.calculateWeatherMultiplier(weatherCondition, pokemon.types);
      
      if (weatherMultiplier < 1) {
        additionalProbability += 5;
      }
    }

    return baseProbability + additionalProbability;
  }

  static shouldTriggerHack(probability: number): boolean {
    const random = Math.random() * 100;
    return random < probability;
  }

  static async triggerHack(
    battleId: number,
    userId: number,
    probability: number
  ): Promise<HackAttempt | null> {
    if (!this.shouldTriggerHack(probability)) {
      return null;
    }

    const hack = await HackModel.getRandomHack();

    await BattleHackModel.create(battleId, hack.id, userId, probability);

    return {
      hack,
      probability,
    };
  }

  static async submitHackSolution(
    userId: number,
    data: SubmitHackSolutionDTO
  ): Promise<HackResult> {
    const battleHack = await BattleHackModel.findById(data.battle_hack_id);
    
    if (!battleHack) {
      throw new NotFoundError('Hack introuvable');
    }

    if (battleHack.user_id !== userId) {
      throw new NotFoundError('Hack introuvable');
    }

    if (battleHack.is_solved) {
      throw new NotFoundError('Ce hack a déjà été résolu');
    }

    const isCorrect = await HackModel.verifySolution(battleHack.hack_id, data.answer);

    await BattleHackModel.submitSolution(data.battle_hack_id, data.answer, isCorrect);

    if (!isCorrect) {
      const hack = await HackModel.findById(battleHack.hack_id);
      const penalty = this.calculatePenalty(hack!);
      
      return {
        is_correct: false,
        penalty,
      };
    }

    return {
      is_correct: true,
    };
  }

  private static calculatePenalty(hack: Hack): { type: 'team_lost' | 'attack_debuff'; value: number } {
    switch (hack.difficulty) {
      case 'Facile':
        return { type: 'attack_debuff', value: 10 };
      case 'Moyenne':
        return { type: 'attack_debuff', value: 20 };
      case 'Difficile':
        return { type: 'attack_debuff', value: 30 };
      case 'Très Difficile':
        return { type: 'team_lost', value: 100 };
      default:
        return { type: 'attack_debuff', value: 15 };
    }
  }

  static async getAllHacks(): Promise<Hack[]> {
    return await HackModel.findAll();
  }

  static async getPendingHacks(userId: number): Promise<Array<{ battleHack: any; hack: Hack }>> {
    const battleHacks = await BattleHackModel.findPendingByUser(userId);
    
    const result = await Promise.all(
      battleHacks.map(async (battleHack) => {
        const hack = await HackModel.findById(battleHack.hack_id);
        return {
          battleHack: {
            id: battleHack.id,
            battle_id: battleHack.battle_id,
            hack_probability: battleHack.hack_probability,
            created_at: battleHack.created_at,
          },
          hack: hack!,
        };
      })
    );

    return result;
  }

  static async getUserHackStats(userId: number): Promise<{ total: number; solved: number; failed: number; success_rate: number }> {
    const stats = await BattleHackModel.getUserHackStats(userId);
    const successRate = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

    return {
      ...stats,
      success_rate: successRate,
    };
  }
}
