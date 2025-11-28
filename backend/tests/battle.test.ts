import { BattleService } from '../src/services/battle.service';
import { DamageCalculator } from '../src/services/damage.calculator';
import { WeatherCondition } from '../src/types/weather.types';

describe('Battle System', () => {
  describe('Damage Calculator', () => {
    it('devrait calculer les dégâts de base correctement', () => {
      const attacker = {
        id: 1,
        name: 'charizard',
        types: ['fire', 'flying'],
        sprite: 'sprite.png',
        stats: {
          hp: 78,
          attack: 84,
          defense: 78,
          specialAttack: 109,
          specialDefense: 85,
          speed: 100,
        },
        height: 17,
        weight: 905,
      };

      const defender = {
        id: 2,
        name: 'blastoise',
        types: ['water'],
        sprite: 'sprite.png',
        stats: {
          hp: 79,
          attack: 83,
          defense: 100,
          specialAttack: 85,
          specialDefense: 105,
          speed: 78,
        },
        height: 16,
        weight: 855,
      };

      const damage = DamageCalculator.calculateDamage(attacker, defender, WeatherCondition.CLEAR, false);
      expect(damage).toBeGreaterThan(0);
    });

    it('devrait appliquer le bonus météo correctement', () => {
      const firePokemon = {
        id: 1,
        name: 'charizard',
        types: ['fire', 'flying'],
        sprite: 'sprite.png',
        stats: {
          hp: 78,
          attack: 84,
          defense: 78,
          specialAttack: 109,
          specialDefense: 85,
          speed: 100,
        },
        height: 17,
        weight: 905,
      };

      const normalPokemon = {
        id: 2,
        name: 'pidgeot',
        types: ['normal', 'flying'],
        sprite: 'sprite.png',
        stats: {
          hp: 83,
          attack: 80,
          defense: 75,
          specialAttack: 70,
          specialDefense: 70,
          speed: 101,
        },
        height: 15,
        weight: 395,
      };

      const damageInSun = DamageCalculator.calculateDamage(firePokemon, normalPokemon, WeatherCondition.CLEAR, false);
      const damageInRain = DamageCalculator.calculateDamage(firePokemon, normalPokemon, WeatherCondition.RAIN, false);

      // En soleil, le Pokémon feu devrait faire plus de dégâts
      expect(damageInSun).toBeGreaterThan(damageInRain);
    });
  });
});
