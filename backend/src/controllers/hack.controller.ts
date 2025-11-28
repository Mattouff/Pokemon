import { Request, Response, NextFunction } from 'express';
import { HackService } from '../services/hack.service';
import { AuthRequest } from '../types/auth.types';
import { validateData } from '../utils/validation.utils';
import { z } from 'zod';

const submitHackSolutionSchema = z.object({
  battle_hack_id: z.number().int().positive(),
  answer: z.string().min(1, 'La réponse est requise'),
});

export class HackController {
  static async getAllHacks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hacks = await HackService.getAllHacks();

      const sanitizedHacks = hacks.map(hack => ({
        id: hack.id,
        code: hack.code,
        type: hack.type,
        difficulty: hack.difficulty,
        description: hack.description,
      }));

      res.status(200).json({
        success: true,
        data: sanitizedHacks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingHacks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const pendingHacks = await HackService.getPendingHacks(user.id);

      const sanitizedHacks = pendingHacks.map(({ battleHack, hack }) => ({
        battle_hack_id: battleHack.id,
        battle_id: battleHack.battle_id,
        hack: {
          code: hack.code,
          type: hack.type,
          difficulty: hack.difficulty,
          description: hack.description,
        },
        probability: battleHack.hack_probability,
        created_at: battleHack.created_at,
      }));

      res.status(200).json({
        success: true,
        data: sanitizedHacks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitSolution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const data = validateData(submitHackSolutionSchema, req.body) as { battle_hack_id: number; answer: string };
      const result = await HackService.submitHackSolution(user.id, data);

      res.status(200).json({
        success: true,
        message: result.is_correct ? 'Hack résolu avec succès !' : 'Réponse incorrecte',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const stats = await HackService.getUserHackStats(user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
