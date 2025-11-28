import { Request, Response, NextFunction } from 'express';
import { PokeAPIService } from '../services/pokeapi.service';

export class PokemonController {
  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const data = await PokeAPIService.getPokemonList(limit, offset);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const pokemon = await PokeAPIService.getPokemon(id);

      res.status(200).json({
        success: true,
        data: pokemon,
      });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.query as string;
      if (!query) {
        res.status(400).json({
          success: false,
          error: { message: 'Le paramètre "query" est requis' },
        });
        return;
      }

      const results = await PokeAPIService.searchPokemons(query);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
