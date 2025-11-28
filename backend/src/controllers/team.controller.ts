import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';
import { AuthRequest } from '../types/auth.types';
import { validateData } from '../utils/validation.utils';
import { createTeamSchema, updateTeamSchema, addPokemonSchema } from '../utils/team.validation';

export class TeamController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const data = validateData(createTeamSchema, req.body) as { name: string };
      const team = await TeamService.createTeam(user.id, data);

      res.status(201).json({
        success: true,
        message: 'Équipe créée avec succès',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teams = await TeamService.getUserTeams(user.id);

      res.status(200).json({
        success: true,
        data: teams,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teamId = parseInt(req.params.id);
      const team = await TeamService.getTeamById(teamId, user.id);

      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teamId = parseInt(req.params.id);
      const data = validateData(updateTeamSchema, req.body) as { name?: string };
      const team = await TeamService.updateTeam(teamId, user.id, data);

      res.status(200).json({
        success: true,
        message: 'Équipe mise à jour',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teamId = parseInt(req.params.id);
      await TeamService.deleteTeam(teamId, user.id);

      res.status(200).json({
        success: true,
        message: 'Équipe supprimée',
      });
    } catch (error) {
      next(error);
    }
  }

  static async addPokemon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teamId = parseInt(req.params.id);
      const data = validateData(addPokemonSchema, req.body) as { pokemon_id: number; position: number; nickname?: string };
      await TeamService.addPokemon(teamId, user.id, data);

      res.status(201).json({
        success: true,
        message: 'Pokémon ajouté à l\'équipe',
      });
    } catch (error) {
      next(error);
    }
  }

  static async removePokemon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teamId = parseInt(req.params.id);
      const pokemonId = parseInt(req.params.pokemonId);
      await TeamService.removePokemon(teamId, user.id, pokemonId);

      res.status(200).json({
        success: true,
        message: 'Pokémon retiré de l\'équipe',
      });
    } catch (error) {
      next(error);
    }
  }

  static async setActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const teamId = parseInt(req.params.id);
      await TeamService.setActiveTeam(teamId, user.id);

      res.status(200).json({
        success: true,
        message: 'Équipe définie comme active',
      });
    } catch (error) {
      next(error);
    }
  }
}
