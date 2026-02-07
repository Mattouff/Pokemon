import { BattleModel } from '../models/battle.model';
import { DamageCalculator } from './damage.calculator';
import { BattleLog, BattleTurn, TurnAction } from '../types/battle.types';
import { Pokemon } from '../types/pokemon.types';
import { WeatherCondition } from '../types/weather.types';

export class BattleService {
  static async getBattleHistory(userId: number, limit: number = 20): Promise<any[]> {
    const battles = await BattleModel.getUserBattlesWithDetails(userId, limit);
    
    return battles.map(battle => {
      const isAttacker = battle.attacker_id === userId;
      
      const battleLog = typeof battle.battle_log === 'string' ? JSON.parse(battle.battle_log) : battle.battle_log;
      const turns = battleLog.turns || [];
      
      const turnCount = battleLog.turn || turns.length;
      const durationSeconds = turnCount * 5;
      

      const finalTurn = turns[turns.length - 1];
      let yourPokemonRemaining = 0;
      let opponentPokemonRemaining = 0;
      
      if (finalTurn) {
        if (isAttacker) {
          yourPokemonRemaining = finalTurn.attacker_pokemon_remaining || 0;
          opponentPokemonRemaining = finalTurn.defender_pokemon_remaining || 0;
        } else {
          yourPokemonRemaining = finalTurn.defender_pokemon_remaining || 0;
          opponentPokemonRemaining = finalTurn.attacker_pokemon_remaining || 0;
        }
      }
      
      let result: 'win' | 'loss' | 'draw';
      if (battle.winner_id === userId) {
        result = 'win';
      } else if (battle.winner_id === null) {
        result = battle.is_ghost_battle ? 'loss' : 'draw';
      } else {
        result = 'loss';
      }
      
      return {
        id: battle.id,
        date: battle.created_at,
        opponent_username: battle.opponent_username || 'IA',
        opponent_type: battle.is_ghost_battle ? 'ai' : 'friend',
        your_team_name: battle.user_team_name || 'Mon équipe',
        result: result,
        duration_seconds: durationSeconds,
        your_pokemon_remaining: yourPokemonRemaining,
        opponent_pokemon_remaining: opponentPokemonRemaining,
      };
    });
  }

  static async getUserStats(userId: number): Promise<{ wins: number; losses: number; draws: number }> {
    return await BattleModel.getUserStats(userId);
  }

  private static _simulateBattle(attackerPokemons: Pokemon[], defenderPokemons: Pokemon[], weatherCondition: WeatherCondition): BattleLog {
    const turns: BattleTurn[] = [];
    let attackerIndex = 0;
    let defenderIndex = 0;
    let attackerHP = attackerPokemons[0].stats.hp;
    let defenderHP = defenderPokemons[0].stats.hp;
    let turn = 1;

    let attackerFainted = 0;
    let defenderFainted = 0;

    const weatherDescription = this.getWeatherDescription(weatherCondition);

    while (attackerIndex < attackerPokemons.length && defenderIndex < defenderPokemons.length) {
      const attackerPokemon = attackerPokemons[attackerIndex];
      const defenderPokemon = defenderPokemons[defenderIndex];

      const attackerDamage = DamageCalculator.calculateDamage(
        attackerPokemon,
        defenderPokemon,
        weatherCondition,
        false // Attaque physique
      );
      
      const defenderDamage = DamageCalculator.calculateDamage(
        defenderPokemon,
        attackerPokemon,
        weatherCondition,
        false // Attaque physique
      );

      const attackerSpeed = attackerPokemon.stats.speed;
      const defenderSpeed = defenderPokemon.stats.speed;

      let attackerAction: TurnAction;
      let defenderAction: TurnAction;

      if (attackerSpeed >= defenderSpeed) {
        defenderHP -= attackerDamage;
        attackerAction = {
          pokemon: {
            id: attackerPokemon.id,
            name: attackerPokemon.name,
            types: attackerPokemon.types,
          },
          hp: attackerHP,
          damage: attackerDamage,
          isFainted: false,
        };

        if (defenderHP <= 0) {
          defenderFainted++;
          defenderAction = {
            pokemon: {
              id: defenderPokemon.id,
              name: defenderPokemon.name,
              types: defenderPokemon.types,
            },
            hp: 0,
            damage: 0,
            isFainted: true,
          };
          defenderIndex++;
          if (defenderIndex < defenderPokemons.length) {
            defenderHP = defenderPokemons[defenderIndex].stats.hp;
          }
        } else {
          attackerHP -= defenderDamage;
          defenderAction = {
            pokemon: {
              id: defenderPokemon.id,
              name: defenderPokemon.name,
              types: defenderPokemon.types,
            },
            hp: defenderHP,
            damage: defenderDamage,
            isFainted: false,
          };

          if (attackerHP <= 0) {
            attackerFainted++;
            attackerAction.isFainted = true;
            attackerAction.hp = 0;
            attackerIndex++;
            if (attackerIndex < attackerPokemons.length) {
              attackerHP = attackerPokemons[attackerIndex].stats.hp;
            }
          }
        }
      } else {
        attackerHP -= defenderDamage;
        defenderAction = {
          pokemon: {
            id: defenderPokemon.id,
            name: defenderPokemon.name,
            types: defenderPokemon.types,
          },
          hp: defenderHP,
          damage: defenderDamage,
          isFainted: false,
        };

        if (attackerHP <= 0) {
          attackerFainted++;
          attackerAction = {
            pokemon: {
              id: attackerPokemon.id,
              name: attackerPokemon.name,
              types: attackerPokemon.types,
            },
            hp: 0,
            damage: 0,
            isFainted: true,
          };
          attackerIndex++;
          if (attackerIndex < attackerPokemons.length) {
            attackerHP = attackerPokemons[attackerIndex].stats.hp;
          }
        } else {
          defenderHP -= attackerDamage;
          attackerAction = {
            pokemon: {
              id: attackerPokemon.id,
              name: attackerPokemon.name,
              types: attackerPokemon.types,
            },
            hp: attackerHP,
            damage: attackerDamage,
            isFainted: false,
          };

          if (defenderHP <= 0) {
            defenderFainted++;
            defenderAction.isFainted = true;
            defenderAction.hp = 0;
            defenderIndex++;
            if (defenderIndex < defenderPokemons.length) {
              defenderHP = defenderPokemons[defenderIndex].stats.hp;
            }
          }
        }
      }

      turns.push({
        turn,
        attacker: attackerAction,
        defender: defenderAction,
        weather: weatherDescription,
        attacker_pokemon_remaining: attackerPokemons.length - attackerFainted,
        defender_pokemon_remaining: defenderPokemons.length - defenderFainted,
      });

      turn++;

      if (turn > 100) break;
    }

    return {
      turns,
      summary: {
        total_turns: turns.length,
        attacker_pokemons_fainted: attackerFainted,
        defender_pokemons_fainted: defenderFainted,
        winner: attackerIndex >= attackerPokemons.length ? 'defender' : defenderIndex >= defenderPokemons.length ? 'attacker' : 'draw',
      },
    };
  }

  private static getWeatherDescription(condition: WeatherCondition): string {
    const descriptions: Record<WeatherCondition, string> = {
      [WeatherCondition.CLEAR]: '☀️ Soleil',
      [WeatherCondition.RAIN]: '🌧️ Pluie',
      [WeatherCondition.SNOW]: '❄️ Neige',
      [WeatherCondition.CLOUDS]: '☁️ Nuageux',
      [WeatherCondition.THUNDERSTORM]: '⛈️ Orage',
      [WeatherCondition.DRIZZLE]: '🌦️ Bruine',
      [WeatherCondition.UNKNOWN]: '🌍 Normal',
    };
    return descriptions[condition] || '🌍 Normal';
  }
}
