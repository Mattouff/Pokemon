import { Request, Response, NextFunction } from 'express';
import { BattleService } from '../services/battle.service';
import { InteractiveBattleService } from '../services/interactive-battle.service';
import { AuthRequest } from '../types/auth.types';
import { validateData } from '../utils/validation.utils';
import { createBattleSchema } from '../utils/friendship.validation';

export class BattleController {
  static async createInteractiveBattle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const data = validateData(createBattleSchema, req.body) as { opponent_id: number };
      const city = req.body.city as string | undefined;
      
      const battle = await InteractiveBattleService.createInteractiveBattle(
        user.id,
        data.opponent_id,
        city
      );

      console.log('✅ Combat créé avec ID:', battle.battle_id);

      res.status(201).json({
        success: true,
        message: 'Combat créé',
        data: battle,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBattle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { battleId } = req.params;
      console.log('🔍 Recherche du combat avec ID:', battleId);
      
      const battle = InteractiveBattleService.getBattle(battleId);

      if (!battle) {
        console.log('❌ Combat introuvable avec ID:', battleId);
        res.status(404).json({
          success: false,
          error: { message: 'Combat introuvable', statusCode: 404 }
        });
        return;
      }

      console.log('✅ Combat trouvé:', battleId);
      console.log('📊 Pokémon joueur:', battle.current_player_pokemon.name, 'HP:', battle.current_player_pokemon.current_hp, '/', battle.current_player_pokemon.max_hp);
      console.log('📊 Pokémon adversaire:', battle.current_opponent_pokemon.name, 'HP:', battle.current_opponent_pokemon.current_hp, '/', battle.current_opponent_pokemon.max_hp);
      
      res.status(200).json({
        success: true,
        data: battle,
      });
    } catch (error) {
      next(error);
    }
  }

  static async performAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const { battleId } = req.params;
      const { action, pokemon_id, move_index, is_forced } = req.body;

      let battle;

      if (action === 'attack') {
        const moveIndex = move_index !== undefined ? move_index : 0;
        battle = await InteractiveBattleService.performAttack(battleId, user.id, moveIndex);
      } else if (action === 'switch' && pokemon_id) {
        const isForced = is_forced === true;
        battle = await InteractiveBattleService.switchPokemon(battleId, user.id, pokemon_id, isForced);
      } else {
        res.status(400).json({
          success: false,
          error: { message: 'Action invalide', statusCode: 400 }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: battle,
      });
    } catch (error) {
      next(error);
    }
  }

  static async fleeBattle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const { battleId } = req.params;
      
      const battle = await InteractiveBattleService.fleeBattle(battleId, user.id);

      res.status(200).json({
        success: true,
        message: 'Vous avez fui le combat',
        data: battle,
      });
    } catch (error) {
      next(error);
    }
  }

  static async startGhostBattle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const data = validateData(createBattleSchema, req.body) as { opponent_id: number };
      const city = req.body.city as string | undefined;
      const result = await BattleService.startGhostBattle(user.id, data, city);

      res.status(201).json({
        success: true,
        message: 'Combat terminé',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBattleHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await BattleService.getBattleHistory(user.id, limit);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const stats = await BattleService.getUserStats(user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
