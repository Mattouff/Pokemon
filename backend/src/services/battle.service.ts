import { BattleModel } from '../models/battle.model';
import { TeamModel } from '../models/team.model';
import { TeamPokemonModel } from '../models/teamPokemon.model';
import { FriendshipModel } from '../models/friendship.model';
import { PokeAPIService } from './pokeapi.service';
import { WeatherService } from './weather.service';
import { DamageCalculator } from './damage.calculator';
import { HackService } from './hack.service';
import { CreateBattleDTO, BattleLog, BattleTurn, TurnAction, BattleResult } from '../types/battle.types';
import { ValidationError } from '../types/errors.types';
import { Pokemon } from '../types/pokemon.types';
import { WeatherCondition } from '../types/weather.types';
import { HackAttempt } from '../types/hack.types';

export class BattleService {
  static async startGhostBattle(userId: number, data: CreateBattleDTO, city?: string): Promise<BattleResult> {
    const isAIBattle = data.opponent_id === 0;
    
    if (!isAIBattle) {
      const areFriends = await FriendshipModel.areFriends(userId, data.opponent_id);
      if (!areFriends) {
        throw new ValidationError('Vous devez être ami avec cet utilisateur pour le défier');
      }
    }

    const attackerTeam = await TeamModel.getActiveTeam(userId);
    if (!attackerTeam) {
      throw new ValidationError('Vous devez avoir une équipe active pour combattre');
    }

    let defenderTeam;
    if (isAIBattle) {
      defenderTeam = { id: 0, name: 'IA', user_id: 0, is_active: true };
    } else {
      defenderTeam = await TeamModel.getActiveTeam(data.opponent_id);
      if (!defenderTeam) {
        throw new ValidationError('Votre adversaire n\'a pas d\'équipe active');
      }
    }

    const attackerPokemons = await TeamPokemonModel.getByTeam(attackerTeam.id);
    
    if (attackerPokemons.length === 0) {
      throw new ValidationError('Votre équipe est vide');
    }

    let defenderPokemons;
    if (isAIBattle) {
      defenderPokemons = attackerPokemons.map((_, index) => ({
        id: 0,
        team_id: 0,
        pokemon_id: Math.floor(Math.random() * 151) + 1,
        position: index + 1,
        nickname: null,
        created_at: new Date()
      }));
    } else {
      defenderPokemons = await TeamPokemonModel.getByTeam(defenderTeam.id);
      if (defenderPokemons.length === 0) {
        throw new ValidationError('L\'équipe de votre adversaire est vide');
      }
    }

    const attackerPokemonData = await Promise.all(
      attackerPokemons.map(p => PokeAPIService.getPokemon(p.pokemon_id))
    );
    const defenderPokemonData = await Promise.all(
      defenderPokemons.map(p => PokeAPIService.getPokemon(p.pokemon_id))
    );

    const weather = await WeatherService.getCurrentWeather(city);

    const hackProbability = HackService.calculateHackProbability(
      attackerPokemonData,
      defenderPokemonData,
      weather.condition
    );

    let hackAttempt: HackAttempt | null = null;
    
    const shouldAttemptHack = Math.random() * 100 < hackProbability;
    
    const battleLog = this.simulateBattle(attackerPokemonData, defenderPokemonData, weather.condition);


    const enhancedBattleLog = {
      ...battleLog,
      is_ai_battle: isAIBattle
    };

    let winnerId: number | null = null;
    if (battleLog.summary.winner === 'attacker') {
      winnerId = userId;
    } else if (battleLog.summary.winner === 'defender') {
      winnerId = isAIBattle ? null : data.opponent_id;
    }

    const battle = await BattleModel.create(
      userId,
      isAIBattle ? userId : data.opponent_id,
      attackerTeam.id,
      isAIBattle ? attackerTeam.id : defenderTeam.id,
      winnerId,
      enhancedBattleLog as BattleLog,
      true
    );

    if (shouldAttemptHack) {
      hackAttempt = await HackService.triggerHack(battle.id, userId, hackProbability);
    }

    const result: BattleResult & { hack?: HackAttempt } = {
      battle_id: battle.id,
      winner: battleLog.summary.winner === 'attacker' ? 'you' : battleLog.summary.winner === 'defender' ? 'opponent' : 'draw',
      your_team: {
        team_name: attackerTeam.name,
        pokemons_alive: attackerPokemons.length - battleLog.summary.attacker_pokemons_fainted,
        pokemons_fainted: battleLog.summary.attacker_pokemons_fainted,
      },
      opponent_team: {
        team_name: defenderTeam.name,
        pokemons_alive: defenderPokemons.length - battleLog.summary.defender_pokemons_fainted,
        pokemons_fainted: battleLog.summary.defender_pokemons_fainted,
      },
      turns: battleLog.turns,
    };

    if (hackAttempt) {
      result.hack = hackAttempt;
    }

    return result;
  }

  static async getBattleHistory(userId: number, limit: number = 20): Promise<any[]> {
    const battles = await BattleModel.getUserBattlesWithDetails(userId, limit);
    
    return battles.map(battle => {
      const isAttacker = battle.attacker_id === userId;
      const opponentId = isAttacker ? battle.defender_id : battle.attacker_id;
      const userTeamId = isAttacker ? battle.attacker_team_id : battle.defender_team_id;
      
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

  private static simulateBattle(attackerPokemons: Pokemon[], defenderPokemons: Pokemon[], weatherCondition: WeatherCondition): BattleLog {
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
