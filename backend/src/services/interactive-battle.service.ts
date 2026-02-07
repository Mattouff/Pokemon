import { TeamModel } from '../models/team.model';
import { TeamPokemonModel } from '../models/teamPokemon.model';
import { PokeAPIService } from './pokeapi.service';
import { WeatherService } from './weather.service';
import { DamageCalculator } from './damage.calculator';
import { ValidationError } from '../types/errors.types';
import { Pokemon } from '../types/pokemon.types';
import { WeatherCondition } from '../types/weather.types';
import { AttackEvent, TurnResult } from '../types/battle.types';
import pool from '../config/database';

interface BattlePokemon {
  id: number;
  pokemon_id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  current_hp: number;
  max_hp: number;
  sprite: string;
  sprite_back?: string;
  moves?: Array<{
    name: string;
    type: string;
    power: number;
    accuracy: number;
    pp: number;
    current_pp: number;
  }>;
}

interface InteractiveBattleState {
  battle_id: string;
  player_id: number;
  opponent_id: number;
  is_ai: boolean;
  player_team: BattlePokemon[];
  opponent_team: BattlePokemon[];
  current_player_pokemon: BattlePokemon;
  current_opponent_pokemon: BattlePokemon;
  weather: WeatherCondition;
  turn: number;
  battle_logs: string[];
  is_finished: boolean;
  winner?: 'player' | 'opponent' | 'draw';
  player_attacked_first?: boolean;
  turn_result?: TurnResult;
}

const activeBattles = new Map<string, InteractiveBattleState>();

export class InteractiveBattleService {
  static async createInteractiveBattle(
    playerId: number, 
    opponentId: number,
    city?: string
  ): Promise<InteractiveBattleState> {
    const isAI = opponentId === 0;

    const playerTeam = await TeamModel.getActiveTeam(playerId);
    if (!playerTeam) {
      throw new ValidationError('Vous devez avoir une équipe active pour combattre');
    }

    const playerPokemons = await TeamPokemonModel.getByTeam(playerTeam.id);
    if (playerPokemons.length === 0) {
      throw new ValidationError('Votre équipe est vide');
    }

    const playerPokemonData = await Promise.all(
      playerPokemons.map(p => PokeAPIService.getPokemonWithMoves(p.pokemon_id))
    );

    let opponentPokemonData: Pokemon[];
    
    if (isAI) {
      opponentPokemonData = await Promise.all(
        playerPokemons.map(() => {
          const randomId = Math.floor(Math.random() * 151) + 1;
          return PokeAPIService.getPokemonWithMoves(randomId);
        })
      );
    } else {
      const opponentTeam = await TeamModel.getActiveTeam(opponentId);
      if (!opponentTeam) {
        throw new ValidationError('Votre adversaire n\'a pas d\'équipe active');
      }
      
      const opponentPokemons = await TeamPokemonModel.getByTeam(opponentTeam.id);
      if (opponentPokemons.length === 0) {
        throw new ValidationError('L\'équipe de votre adversaire est vide');
      }

      opponentPokemonData = await Promise.all(
        opponentPokemons.map(p => PokeAPIService.getPokemonWithMoves(p.pokemon_id))
      );
    }

    const weather = await WeatherService.getCurrentWeather(city);

    const battleId = `battle_${Date.now()}_${playerId}`;
    
    const battleState: InteractiveBattleState = {
      battle_id: battleId,
      player_id: playerId,
      opponent_id: opponentId,
      is_ai: isAI,
      player_team: playerPokemonData.map(p => this.pokemonToBattlePokemon(p)),
      opponent_team: opponentPokemonData.map(p => this.pokemonToBattlePokemon(p)),
      current_player_pokemon: this.pokemonToBattlePokemon(playerPokemonData[0]),
      current_opponent_pokemon: this.pokemonToBattlePokemon(opponentPokemonData[0]),
      weather: weather.condition,
      turn: 1,
      battle_logs: [
        'Le combat commence !',
        `${playerPokemonData[0].name.toUpperCase()} entre en jeu !`,
        `${opponentPokemonData[0].name.toUpperCase()} entre en jeu !`
      ],
      is_finished: false
    };

    activeBattles.set(battleId, battleState);
    console.log('💾 Combat stocké dans la Map avec ID:', battleId);
    console.log('📊 Nombre total de combats actifs:', activeBattles.size);

    return battleState;
  }

  static getBattle(battleId: string): InteractiveBattleState | null {
    return activeBattles.get(battleId) || null;
  }

  static async performAttack(battleId: string, playerId: number, moveIndex: number = 0): Promise<InteractiveBattleState> {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new ValidationError('Combat introuvable');
    }

    if (battle.player_id !== playerId) {
      throw new ValidationError('Ce n\'est pas votre combat');
    }

    if (battle.is_finished) {
      throw new ValidationError('Le combat est terminé');
    }

    const playerMove = battle.current_player_pokemon.moves?.[moveIndex];
    if (!playerMove) {
      throw new ValidationError('Attaque invalide');
    }

    if (playerMove.current_pp <= 0) {
      throw new ValidationError('Plus de PP pour cette attaque');
    }

    playerMove.current_pp--;


    const playerSpeed = battle.current_player_pokemon.stats.speed;
    const opponentSpeed = battle.current_opponent_pokemon.stats.speed;
    const playerFirst = playerSpeed >= opponentSpeed;

    const opponentMoves = battle.current_opponent_pokemon.moves?.filter(m => m.current_pp > 0) || [];
    const opponentMove = opponentMoves.length > 0 
      ? opponentMoves[Math.floor(Math.random() * opponentMoves.length)]
      : null;

    battle.player_attacked_first = playerFirst;
    
    const turnResult: TurnResult = {
      first_attack: null,
      second_attack: null,
      battle_ended: false
    };
    
    if (playerFirst) {
      // Le joueur attaque en premier - Calculer les dégâts maintenant
      const playerDamage = DamageCalculator.calculateDamage(
        this.battlePokemonToPokemon(battle.current_player_pokemon),
        this.battlePokemonToPokemon(battle.current_opponent_pokemon),
        battle.weather,
        false,
        playerMove.power,
        playerMove.type
      );
      
      const opponentHpBefore = battle.current_opponent_pokemon.current_hp;
      battle.current_opponent_pokemon.current_hp = Math.max(
        0,
        battle.current_opponent_pokemon.current_hp - playerDamage
      );
      
      // Mettre à jour les HP dans l'équipe adverse 
      const opponentInTeam = battle.opponent_team.find(p => p.id === battle.current_opponent_pokemon.id);
      if (opponentInTeam) {
        opponentInTeam.current_hp = battle.current_opponent_pokemon.current_hp;
      }

      // Vérifier si l'adversaire est K.O.
      let nextPokemonName: string | undefined;
      let opponentWasKO = false;
      if (battle.current_opponent_pokemon.current_hp === 0) {
        opponentWasKO = true;
        // Trouver le prochain Pokémon adverse
        const nextOpponentIndex = battle.opponent_team.findIndex(
          p => p.id === battle.current_opponent_pokemon.id
        ) + 1;

        if (nextOpponentIndex < battle.opponent_team.length) {
          // Créer une copie du Pokémon au lieu d'utiliser la référence
          const nextPokemon = battle.opponent_team[nextOpponentIndex];
          battle.current_opponent_pokemon = JSON.parse(JSON.stringify(nextPokemon));
          nextPokemonName = battle.current_opponent_pokemon.name;
        } else {
          // Le joueur a gagné
          battle.is_finished = true;
          battle.winner = 'player';
          turnResult.battle_ended = true;
          turnResult.winner = 'player';
          battle.battle_logs.push('🏆 VICTOIRE ! Tous les Pokémon adverses sont K.O. !');
          await this.saveBattleToDatabase(battle);
        }
      }
      
      // Créer l'événement de la première attaque
      turnResult.first_attack = this.createAttackEvent(
        battle.current_player_pokemon,
        opponentInTeam || battle.current_opponent_pokemon,
        true,
        playerMove.name,
        playerDamage,
        opponentHpBefore,
        Math.max(0, opponentHpBefore - playerDamage),
        battle.current_opponent_pokemon.max_hp,
        nextPokemonName
      );
      
      // Ajouter les logs au battle
      turnResult.first_attack.logs.forEach(log => battle.battle_logs.push(log));
      
      // Ne contre-attaquer que si l'adversaire n'a pas été K.O. et le combat n'est pas fini
      // Si un K.O. a eu lieu, le tour se termine même si un nouveau Pokémon entre
      if (!battle.is_finished && !opponentWasKO && battle.current_opponent_pokemon.current_hp > 0) {
        // L'adversaire n'est pas K.O., il contre-attaque
        let opponentDamage = 50;
        let opponentMoveName: string | undefined;
        
        if (opponentMove) {
          opponentMove.current_pp--;
          opponentDamage = DamageCalculator.calculateDamage(
            this.battlePokemonToPokemon(battle.current_opponent_pokemon),
            this.battlePokemonToPokemon(battle.current_player_pokemon),
            battle.weather,
            false,
            opponentMove.power,
            opponentMove.type
          );
          opponentMoveName = opponentMove.name;
        } else {
          opponentDamage = DamageCalculator.calculateDamage(
            this.battlePokemonToPokemon(battle.current_opponent_pokemon),
            this.battlePokemonToPokemon(battle.current_player_pokemon),
            battle.weather,
            false
          );
        }

        const playerHpBefore = battle.current_player_pokemon.current_hp;
        battle.current_player_pokemon.current_hp = Math.max(
          0,
          battle.current_player_pokemon.current_hp - opponentDamage
        );
        
        // Mettre à jour les HP dans l'équipe du joueur pour garder la cohérence
        const playerInTeam = battle.player_team.find(p => p.id === battle.current_player_pokemon.id);
        if (playerInTeam) {
          playerInTeam.current_hp = battle.current_player_pokemon.current_hp;
        }

        if (battle.current_player_pokemon.current_hp === 0) {
          const alivePlayerPokemons = battle.player_team.filter(p => p.current_hp > 0);
          if (alivePlayerPokemons.length === 0) {
            battle.is_finished = true;
            battle.winner = 'opponent';
            turnResult.battle_ended = true;
            turnResult.winner = 'opponent';
            battle.battle_logs.push('💀 DÉFAITE ! Tous vos Pokémon sont K.O. !');
            await this.saveBattleToDatabase(battle);
          }
        }
        
        // Créer l'événement de la deuxième attaque
        turnResult.second_attack = this.createAttackEvent(
          battle.current_opponent_pokemon,
          playerInTeam || battle.current_player_pokemon,
          false,
          opponentMoveName,
          opponentDamage,
          playerHpBefore,
          Math.max(0, playerHpBefore - opponentDamage),
          battle.current_player_pokemon.max_hp
        );
        
        // Ajouter les logs au battle
        turnResult.second_attack.logs.forEach(log => battle.battle_logs.push(log));
      }
    } else {
      // L'adversaire attaque en premier
      let opponentDamage = 50;
      let opponentMoveName: string | undefined;
      
      if (opponentMove) {
        opponentMove.current_pp--;
        opponentDamage = DamageCalculator.calculateDamage(
          this.battlePokemonToPokemon(battle.current_opponent_pokemon),
          this.battlePokemonToPokemon(battle.current_player_pokemon),
          battle.weather,
          false,
          opponentMove.power,
          opponentMove.type
        );
        opponentMoveName = opponentMove.name;
      } else {
        opponentDamage = DamageCalculator.calculateDamage(
          this.battlePokemonToPokemon(battle.current_opponent_pokemon),
          this.battlePokemonToPokemon(battle.current_player_pokemon),
          battle.weather,
          false
        );
      }

      const playerHpBefore = battle.current_player_pokemon.current_hp;
      battle.current_player_pokemon.current_hp = Math.max(
        0,
        battle.current_player_pokemon.current_hp - opponentDamage
      );
      
      // Mettre à jour les HP dans l'équipe du joueur pour garder la cohérence
      const playerInTeam2 = battle.player_team.find(p => p.id === battle.current_player_pokemon.id);
      if (playerInTeam2) {
        playerInTeam2.current_hp = battle.current_player_pokemon.current_hp;
      }

      // Vérifier si le joueur est K.O.
      let playerWasKO = false;
      if (battle.current_player_pokemon.current_hp === 0) {
        playerWasKO = true;
        const alivePlayerPokemons = battle.player_team.filter(p => p.current_hp > 0);
        if (alivePlayerPokemons.length === 0) {
          battle.is_finished = true;
          battle.winner = 'opponent';
          turnResult.battle_ended = true;
          turnResult.winner = 'opponent';
          battle.battle_logs.push('💀 DÉFAITE ! Tous vos Pokémon sont K.O. !');
          await this.saveBattleToDatabase(battle);
        }
      }
      
      // Créer l'événement de la première attaque (adversaire)
      turnResult.first_attack = this.createAttackEvent(
        battle.current_opponent_pokemon,
        playerInTeam2 || battle.current_player_pokemon,
        false,
        opponentMoveName,
        opponentDamage,
        playerHpBefore,
        Math.max(0, playerHpBefore - opponentDamage),
        battle.current_player_pokemon.max_hp
      );
      
      // Ajouter les logs au battle
      turnResult.first_attack.logs.forEach(log => battle.battle_logs.push(log));
      
      // Le joueur contre-attaque seulement s'il n'a pas été K.O. et le combat n'est pas fini
      // Si un K.O. a eu lieu, le tour se termine
      if (!battle.is_finished && !playerWasKO && battle.current_player_pokemon.current_hp > 0) {
        // Le joueur n'est pas K.O., il contre-attaque - Calculer les dégâts maintenant
        const playerDamage = DamageCalculator.calculateDamage(
          this.battlePokemonToPokemon(battle.current_player_pokemon),
          this.battlePokemonToPokemon(battle.current_opponent_pokemon),
          battle.weather,
          false,
          playerMove.power,
          playerMove.type
        );
        
        const opponentHpBefore = battle.current_opponent_pokemon.current_hp;
        battle.current_opponent_pokemon.current_hp = Math.max(
          0,
          battle.current_opponent_pokemon.current_hp - playerDamage
        );
        
        // Mettre à jour les HP dans l'équipe adverse pour garder la cohérence
        const opponentInTeam2 = battle.opponent_team.find(p => p.id === battle.current_opponent_pokemon.id);
        if (opponentInTeam2) {
          opponentInTeam2.current_hp = battle.current_opponent_pokemon.current_hp;
        }

        let nextPokemonName: string | undefined;
        if (battle.current_opponent_pokemon.current_hp === 0) {
          const nextOpponentIndex = battle.opponent_team.findIndex(
            p => p.id === battle.current_opponent_pokemon.id
          ) + 1;

          if (nextOpponentIndex < battle.opponent_team.length) {
            // Créer une copie du Pokémon au lieu d'utiliser la référence
            const nextPokemon = battle.opponent_team[nextOpponentIndex];
            battle.current_opponent_pokemon = JSON.parse(JSON.stringify(nextPokemon));
            nextPokemonName = battle.current_opponent_pokemon.name;
          } else {
            battle.is_finished = true;
            battle.winner = 'player';
            turnResult.battle_ended = true;
            turnResult.winner = 'player';
            battle.battle_logs.push('🏆 VICTOIRE ! Tous les Pokémon adverses sont K.O. !');
            await this.saveBattleToDatabase(battle);
          }
        }
        
        // Créer l'événement de la deuxième attaque (joueur)
        turnResult.second_attack = this.createAttackEvent(
          battle.current_player_pokemon,
          opponentInTeam2 || battle.current_opponent_pokemon,
          true,
          playerMove.name,
          playerDamage,
          opponentHpBefore,
          Math.max(0, opponentHpBefore - playerDamage),
          battle.current_opponent_pokemon.max_hp,
          nextPokemonName
        );
        
        // Ajouter les logs au battle
        turnResult.second_attack.logs.forEach(log => battle.battle_logs.push(log));
      }
    }

    battle.turn++;
    battle.turn_result = turnResult;
    activeBattles.set(battleId, battle);

    return battle;
  }

  /**
   * Créer un événement d'attaque
   */
  private static createAttackEvent(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    attackerIsPlayer: boolean,
    moveName: string | undefined,
    damage: number,
    hpBefore: number,
    hpAfter: number,
    maxHp: number,
    nextPokemonName?: string
  ): AttackEvent {
    const logs: string[] = [];
    
    if (moveName) {
      logs.push(`${attacker.name.toUpperCase()} utilise ${moveName} !`);
    } else {
      logs.push(`${attacker.name.toUpperCase()} attaque !`);
    }
    
    logs.push(`${defender.name.toUpperCase()} perd ${damage} HP`);
    
    const isKO = hpAfter === 0;
    if (isKO) {
      logs.push(`${defender.name.toUpperCase()} est K.O. !`);
      if (nextPokemonName) {
        logs.push(`${nextPokemonName.toUpperCase()} entre en jeu !`);
      }
    }
    
    return {
      attacker_name: attacker.name,
      attacker_is_player: attackerIsPlayer,
      defender_name: defender.name,
      defender_is_player: !attackerIsPlayer,
      move_name: moveName,
      damage,
      defender_hp_before: hpBefore,
      defender_hp_after: hpAfter,
      defender_max_hp: maxHp,
      is_ko: isKO,
      next_pokemon_name: nextPokemonName,
      logs
    };
  }

  /**
   * Changer de Pokémon
   */
  static async switchPokemon(
    battleId: string, 
    playerId: number, 
    pokemonId: number,
    isForced: boolean = false // true si le changement est forcé (Pokémon K.O.)
  ): Promise<InteractiveBattleState> {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new ValidationError('Combat introuvable');
    }

    if (battle.player_id !== playerId) {
      throw new ValidationError('Ce n\'est pas votre combat');
    }

    if (battle.is_finished) {
      throw new ValidationError('Le combat est terminé');
    }

    const newPokemon = battle.player_team.find(p => p.id === pokemonId);
    if (!newPokemon) {
      throw new ValidationError('Pokémon introuvable');
    }

    if (newPokemon.current_hp === 0) {
      throw new ValidationError('Ce Pokémon est K.O.');
    }

    if (newPokemon.id === battle.current_player_pokemon.id) {
      throw new ValidationError('Ce Pokémon est déjà en jeu');
    }

    const wasKO = battle.current_player_pokemon.current_hp === 0;

    battle.battle_logs.push(`${battle.current_player_pokemon.name.toUpperCase()} revient !`);
    // Créer une copie du Pokémon au lieu d'utiliser la référence
    battle.current_player_pokemon = JSON.parse(JSON.stringify(newPokemon));
    battle.battle_logs.push(`${newPokemon.name.toUpperCase()} entre en jeu !`);

    // L'adversaire attaque SEULEMENT si le changement est volontaire (Pokémon pas K.O.)
    if (!wasKO && !isForced) {
      // Choisir une attaque aléatoire de l'adversaire avec des PP disponibles
      const opponentMoves = battle.current_opponent_pokemon.moves?.filter(m => m.current_pp > 0) || [];
      let opponentMove = opponentMoves[Math.floor(Math.random() * opponentMoves.length)];
      let opponentDamage = 50; // Dégâts par défaut
      
      if (opponentMove) {
        opponentMove.current_pp--;
        opponentDamage = DamageCalculator.calculateDamage(
          this.battlePokemonToPokemon(battle.current_opponent_pokemon),
          this.battlePokemonToPokemon(battle.current_player_pokemon),
          battle.weather,
          false,
          opponentMove.power,
          opponentMove.type
        );
        battle.battle_logs.push(`${battle.current_opponent_pokemon.name.toUpperCase()} profite du changement pour utiliser ${opponentMove.name} !`);
      } else {
        opponentDamage = DamageCalculator.calculateDamage(
          this.battlePokemonToPokemon(battle.current_opponent_pokemon),
          this.battlePokemonToPokemon(battle.current_player_pokemon),
          battle.weather,
          false
        );
        battle.battle_logs.push(`${battle.current_opponent_pokemon.name} profite du changement pour attaquer !`);
      }

      battle.current_player_pokemon.current_hp = Math.max(
        0,
        battle.current_player_pokemon.current_hp - opponentDamage
      );

      battle.battle_logs.push(`${battle.current_player_pokemon.name} perd ${opponentDamage} HP`);

      if (battle.current_player_pokemon.current_hp === 0) {
        battle.battle_logs.push(`${battle.current_player_pokemon.name} est K.O. !`);
      }
    }

    battle.turn++;
    activeBattles.set(battleId, battle);

    return battle;
  }

  /**
   * Fuir le combat (défaite automatique)
   */
  static async fleeBattle(battleId: string, playerId: number): Promise<InteractiveBattleState> {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new ValidationError('Combat introuvable');
    }

    if (battle.player_id !== playerId) {
      throw new ValidationError('Ce n\'est pas votre combat');
    }

    if (battle.is_finished) {
      throw new ValidationError('Le combat est déjà terminé');
    }

    // Marquer le combat comme terminé avec une défaite
    battle.is_finished = true;
    battle.winner = 'opponent';
    battle.battle_logs.push('🏃 Vous avez fui le combat !');
    battle.battle_logs.push('💀 DÉFAITE par abandon !');

    console.log(`🔴 AVANT saveBattleToDatabase - Battle ID: ${battle.battle_id}, Is AI: ${battle.is_ai}`);
    await this.saveBattleToDatabase(battle);
    console.log(`🟢 APRÈS saveBattleToDatabase`);
    activeBattles.set(battleId, battle);

    return battle;
  }

  /**
   * Convertir un Pokemon en BattlePokemon
   */
  private static pokemonToBattlePokemon(pokemon: Pokemon): BattlePokemon {
    return {
      id: pokemon.id,
      pokemon_id: pokemon.id,
      name: pokemon.name,
      stats: {
        hp: pokemon.stats.hp,
        attack: pokemon.stats.attack,
        defense: pokemon.stats.defense,
        specialAttack: pokemon.stats.specialAttack,
        specialDefense: pokemon.stats.specialDefense,
        speed: pokemon.stats.speed
      },
      types: [...pokemon.types], // Copie du tableau
      current_hp: pokemon.stats.hp,
      max_hp: pokemon.stats.hp,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      sprite_back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemon.id}.png`,
      moves: pokemon.moves?.map(m => ({
        name: m.name,
        type: m.type,
        power: m.power,
        accuracy: m.accuracy,
        pp: m.pp,
        current_pp: m.pp
      }))
    };
  }

  /**
   * Convertir un BattlePokemon en Pokemon
   */
  private static battlePokemonToPokemon(battlePokemon: BattlePokemon): Pokemon {
    return {
      id: battlePokemon.pokemon_id,
      name: battlePokemon.name,
      types: battlePokemon.types,
      stats: battlePokemon.stats,
      sprite: battlePokemon.sprite,
      sprites: {
        front_default: battlePokemon.sprite,
        back_default: battlePokemon.sprite_back || battlePokemon.sprite
      },
      height: 0,
      weight: 0
    } as Pokemon;
  }

  /**
   * Sauvegarder la bataille en base de données quand elle se termine
   */
  private static async saveBattleToDatabase(battle: InteractiveBattleState): Promise<void> {
    try {
      console.log(`💾 Tentative de sauvegarde du combat ${battle.battle_id} - Winner: ${battle.winner}, Is AI: ${battle.is_ai}`);
      
      // Récupérer l'équipe du joueur
      const playerTeam = await TeamModel.getActiveTeam(battle.player_id);
      
      if (!playerTeam) {
        console.error('Impossible de récupérer l\'équipe du joueur pour sauvegarder la bataille');
        return;
      }

      // Pour les combats IA, créer une équipe fictive ou utiliser l'ID du joueur comme adversaire
      let opponentId = battle.opponent_id;
      let opponentTeamId = playerTeam.id; // Par défaut, utiliser la même équipe
      
      if (!battle.is_ai) {
        // Combat contre un ami - récupérer la vraie équipe de l'adversaire
        const opponentTeam = await TeamModel.getActiveTeam(battle.opponent_id);
        if (opponentTeam) {
          opponentTeamId = opponentTeam.id;
        }
      } else {
        // Combat IA - utiliser l'ID du joueur comme adversaire et la même équipe
        opponentId = battle.player_id;
        opponentTeamId = playerTeam.id;
      }
      
      console.log(`📝 Données de sauvegarde: player=${battle.player_id}, opponent=${opponentId}, playerTeam=${playerTeam.id}, opponentTeam=${opponentTeamId}, isAI=${battle.is_ai}`);

      // Déterminer le winner_id
      let winnerId: number | null = null;
      if (battle.winner === 'player') {
        winnerId = battle.player_id;
      } else if (battle.winner === 'opponent') {
        // Pour les combats IA, mettre NULL (on détectera la défaite via is_ghost_battle)
        // Pour les combats amis, mettre l'ID de l'adversaire
        winnerId = battle.is_ai ? null : battle.opponent_id;
      }

      // Calculer les Pokémon restants
      const playerPokemonRemaining = battle.player_team.filter(p => p.current_hp > 0).length;
      const opponentPokemonRemaining = battle.opponent_team.filter(p => p.current_hp > 0).length;

      // Insérer dans la base de données
      await pool.query(
        `INSERT INTO battles (attacker_id, defender_id, attacker_team_id, defender_team_id, winner_id, battle_log, is_ghost_battle)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          battle.player_id,
          opponentId,
          playerTeam.id,
          opponentTeamId,
          winnerId,
          JSON.stringify({
            battle_id: battle.battle_id,
            turn: battle.turn,
            weather: battle.weather,
            logs: battle.battle_logs,
            turns: [{
              attacker_pokemon_remaining: playerPokemonRemaining,
              defender_pokemon_remaining: opponentPokemonRemaining
            }]
          }),
          battle.is_ai // is_ghost_battle = true pour IA, false pour ami
        ]
      );

      console.log(`✅ Combat sauvegardé: ${battle.battle_id} - Winner ID: ${winnerId}, Is Ghost: ${battle.is_ai}`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du combat:', error);
      console.error('Stack:', error);
    }
  }
}
