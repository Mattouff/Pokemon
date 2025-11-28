import { Pokemon } from '../types/pokemon.types';
import { WeatherCondition } from '../types/weather.types';
import { WeatherService } from './weather.service';

export class DamageCalculator {
  static calculateDamage(
    attacker: Pokemon,
    defender: Pokemon,
    weatherCondition: WeatherCondition,
    isSpecialAttack: boolean = false,
    movePower: number = 50,
    moveType?: string
  ): number {
    const level = 50;
    const power = movePower;

    const attack = isSpecialAttack ? attacker.stats.specialAttack : attacker.stats.attack;
    const defense = isSpecialAttack ? defender.stats.specialDefense : defender.stats.defense;


    const baseDamage = Math.floor(
      ((((2 * level / 5 + 2) * attack * power) / defense) / 50 + 2)
    );

    const weatherMultiplier = WeatherService.calculateWeatherMultiplier(weatherCondition, attacker.types);
    const typeEffectiveness = this.getTypeEffectiveness(moveType ? [moveType] : attacker.types, defender.types);
    const randomFactor = 0.85 + Math.random() * 0.15;
    const stab = this.hasSTAB(attacker.types, moveType) ? 1.5 : 1.0;

    const finalDamage = Math.floor(
      baseDamage * weatherMultiplier * typeEffectiveness * randomFactor * stab
    );

    return Math.max(1, finalDamage);
  }

  private static getTypeEffectiveness(attackerTypes: string[], defenderTypes: string[]): number {
    const typeChart: Record<string, { strong: string[]; weak: string[] }> = {
      fire: { strong: ['grass', 'ice', 'bug', 'steel'], weak: ['water', 'rock', 'dragon'] },
      water: { strong: ['fire', 'ground', 'rock'], weak: ['grass', 'electric', 'dragon'] },
      grass: { strong: ['water', 'ground', 'rock'], weak: ['fire', 'ice', 'poison', 'flying', 'bug'] },
      electric: { strong: ['water', 'flying'], weak: ['grass', 'electric', 'dragon'] },
      ice: { strong: ['grass', 'ground', 'flying', 'dragon'], weak: ['fire', 'fighting', 'rock', 'steel'] },
      fighting: { strong: ['normal', 'ice', 'rock', 'dark', 'steel'], weak: ['flying', 'psychic', 'fairy'] },
      poison: { strong: ['grass', 'fairy'], weak: ['poison', 'ground', 'rock', 'ghost'] },
      ground: { strong: ['fire', 'electric', 'poison', 'rock', 'steel'], weak: ['grass', 'bug'] },
      flying: { strong: ['grass', 'fighting', 'bug'], weak: ['electric', 'ice', 'rock'] },
      psychic: { strong: ['fighting', 'poison'], weak: ['bug', 'ghost', 'dark'] },
      bug: { strong: ['grass', 'psychic', 'dark'], weak: ['fire', 'flying', 'rock'] },
      rock: { strong: ['fire', 'ice', 'flying', 'bug'], weak: ['water', 'grass', 'fighting', 'ground', 'steel'] },
      ghost: { strong: ['psychic', 'ghost'], weak: ['ghost', 'dark'] },
      dragon: { strong: ['dragon'], weak: ['ice', 'dragon', 'fairy'] },
      dark: { strong: ['psychic', 'ghost'], weak: ['fighting', 'bug', 'fairy'] },
      steel: { strong: ['ice', 'rock', 'fairy'], weak: ['fire', 'fighting', 'ground'] },
      fairy: { strong: ['fighting', 'dragon', 'dark'], weak: ['poison', 'steel'] },
      normal: { strong: [], weak: ['fighting'] },
    };

    let effectiveness = 1.0;

    for (const attackType of attackerTypes) {
      const typeData = typeChart[attackType];
      if (!typeData) continue;

      for (const defenseType of defenderTypes) {
        if (typeData.strong.includes(defenseType)) {
          effectiveness *= 2.0;
        } else if (typeData.weak.includes(defenseType)) {
          effectiveness *= 0.5;
        }
      }
    }

    return effectiveness;
  }

  private static hasSTAB(pokemonTypes: string[], moveType?: string): boolean {
    if (!moveType) return true;
    return pokemonTypes.includes(moveType);
  }

  static calculateTeamPower(
    pokemons: Pokemon[],
    weatherCondition: WeatherCondition
  ): { totalHP: number; totalAttack: number; totalDefense: number; weatherBonus: number } {
    let totalHP = 0;
    let totalAttack = 0;
    let totalDefense = 0;
    let weatherBonus = 0;

    for (const pokemon of pokemons) {
      totalHP += pokemon.stats.hp;
      totalAttack += pokemon.stats.attack + pokemon.stats.specialAttack;
      totalDefense += pokemon.stats.defense + pokemon.stats.specialDefense;
      
      const multiplier = WeatherService.calculateWeatherMultiplier(weatherCondition, pokemon.types);
      if (multiplier > 1) {
        weatherBonus += (multiplier - 1) * 100;
      } else if (multiplier < 1) {
        weatherBonus -= (1 - multiplier) * 100;
      }
    }

    return { totalHP, totalAttack, totalDefense, weatherBonus };
  }

  static quickBattle(
    attackerPokemons: Pokemon[],
    defenderPokemons: Pokemon[],
    weatherCondition: WeatherCondition
  ): 'attacker' | 'defender' | 'draw' {
    const attackerStats = this.calculateTeamPower(attackerPokemons, weatherCondition);
    const defenderStats = this.calculateTeamPower(defenderPokemons, weatherCondition);

    const attackerScore = (attackerStats.totalAttack * (1 + attackerStats.weatherBonus / 100)) - defenderStats.totalDefense;
    const defenderScore = (defenderStats.totalAttack * (1 + defenderStats.weatherBonus / 100)) - attackerStats.totalDefense;

    const attackerFinalScore = attackerScore * (attackerStats.totalHP / 100);
    const defenderFinalScore = defenderScore * (defenderStats.totalHP / 100);

    if (Math.abs(attackerFinalScore - defenderFinalScore) < 10) {
      return 'draw';
    }

    return attackerFinalScore > defenderFinalScore ? 'attacker' : 'defender';
  }
}
