import { TeamModel } from '../models/team.model';
import { TeamPokemonModel } from '../models/teamPokemon.model';
import { PokeAPIService } from './pokeapi.service';
import { CreateTeamDTO, UpdateTeamDTO, AddPokemonDTO, TeamWithPokemons } from '../types/team.types';
import { ConflictError, NotFoundError, ValidationError } from '../types/errors.types';

export class TeamService {
  static async createTeam(userId: number, data: CreateTeamDTO): Promise<TeamWithPokemons> {
    const team = await TeamModel.create(userId, data.name);
    return {
      ...team,
      pokemons: [],
    };
  }

  static async getUserTeams(userId: number): Promise<TeamWithPokemons[]> {
    const teams = await TeamModel.findByUser(userId);
    const teamsWithPokemons = await Promise.all(
      teams.map(async (team) => {
        const teamPokemons = await TeamPokemonModel.getByTeam(team.id);
        
        // Enrichir avec les données de PokeAPI
        const pokemons = await Promise.all(
          teamPokemons.map(async (tp) => {
            const pokemonData = await PokeAPIService.getPokemon(tp.pokemon_id);
            return {
              id: tp.id,
              pokemon_id: tp.pokemon_id,
              name: pokemonData.name,
              sprite: pokemonData.sprite,
              types: pokemonData.types,
              position: tp.position,
              nickname: tp.nickname
            };
          })
        );
        
        return { ...team, pokemons, pokemon_count: pokemons.length };
      })
    );
    return teamsWithPokemons;
  }

  static async getTeamById(teamId: number, userId: number): Promise<TeamWithPokemons> {
    const team = await TeamModel.findById(teamId);
    if (!team) {
      throw new NotFoundError('Équipe introuvable');
    }

    if (team.user_id !== userId) {
      throw new NotFoundError('Équipe introuvable');
    }

    const teamPokemons = await TeamPokemonModel.getByTeam(teamId);
    
    // Enrichir avec les données de PokeAPI
    const pokemons = await Promise.all(
      teamPokemons.map(async (tp) => {
        const pokemonData = await PokeAPIService.getPokemon(tp.pokemon_id);
        return {
          id: tp.id,
          pokemon_id: tp.pokemon_id,
          name: pokemonData.name,
          sprite: pokemonData.sprite,
          types: pokemonData.types,
          position: tp.position,
          nickname: tp.nickname
        };
      })
    );
    
    return { ...team, pokemons };
  }

  static async updateTeam(teamId: number, userId: number, data: UpdateTeamDTO): Promise<TeamWithPokemons> {
    const team = await TeamModel.findById(teamId);
    if (!team) {
      throw new NotFoundError('Équipe introuvable');
    }

    if (team.user_id !== userId) {
      throw new NotFoundError('Équipe introuvable');
    }

    const updatedTeam = data.name ? await TeamModel.update(teamId, data.name) : team;
    
    const teamPokemons = await TeamPokemonModel.getByTeam(teamId);
    
    // Enrichir avec les données de PokeAPI
    const pokemons = await Promise.all(
      teamPokemons.map(async (tp) => {
        const pokemonData = await PokeAPIService.getPokemon(tp.pokemon_id);
        return {
          id: tp.id,
          pokemon_id: tp.pokemon_id,
          name: pokemonData.name,
          sprite: pokemonData.sprite,
          types: pokemonData.types,
          position: tp.position,
          nickname: tp.nickname
        };
      })
    );
    
    return { ...updatedTeam, pokemons };
  }

  static async deleteTeam(teamId: number, userId: number): Promise<void> {
    const team = await TeamModel.findById(teamId);
    if (!team) {
      throw new NotFoundError('Équipe introuvable');
    }

    if (team.user_id !== userId) {
      throw new NotFoundError('Équipe introuvable');
    }

    await TeamModel.delete(teamId);
  }

  static async addPokemon(teamId: number, userId: number, data: AddPokemonDTO): Promise<void> {
    const team = await TeamModel.findById(teamId);
    if (!team || team.user_id !== userId) {
      throw new NotFoundError('Équipe introuvable');
    }

    if (data.position < 1 || data.position > 6) {
      throw new ValidationError('La position doit être entre 1 et 6');
    }

    const count = await TeamPokemonModel.count(teamId);
    if (count >= 6) {
      throw new ConflictError('L\'équipe est complète (6 Pokémon maximum)');
    }

    const exists = await PokeAPIService.verifyPokemonExists(data.pokemon_id);
    if (!exists) {
      throw new NotFoundError(`Pokémon avec l'ID ${data.pokemon_id} introuvable`);
    }

    const alreadyInTeam = await TeamPokemonModel.exists(teamId, data.pokemon_id);
    if (alreadyInTeam) {
      throw new ConflictError('Ce Pokémon est déjà dans l\'équipe');
    }

    // Trouver la première position libre
    const teamPokemons = await TeamPokemonModel.getByTeam(teamId);
    const usedPositions = teamPokemons.map(p => p.position);
    let freePosition = data.position;
    
    // Si la position demandée est prise, trouver la première libre
    if (usedPositions.includes(data.position)) {
      for (let i = 1; i <= 6; i++) {
        if (!usedPositions.includes(i)) {
          freePosition = i;
          break;
        }
      }
    }

    await TeamPokemonModel.add(teamId, data.pokemon_id, freePosition, data.nickname);
  }

  static async removePokemon(teamId: number, userId: number, pokemonId: number): Promise<void> {
    const team = await TeamModel.findById(teamId);
    if (!team || team.user_id !== userId) {
      throw new NotFoundError('Équipe introuvable');
    }

    await TeamPokemonModel.remove(teamId, pokemonId);
  }

  static async setActiveTeam(teamId: number, userId: number): Promise<void> {
    const team = await TeamModel.findById(teamId);
    if (!team || team.user_id !== userId) {
      throw new NotFoundError('Équipe introuvable');
    }

    // Vérifier qu'il y a au moins 1 Pokémon
    const teamPokemons = await TeamPokemonModel.getByTeam(teamId);
    if (teamPokemons.length === 0) {
      throw new ValidationError('Une équipe doit avoir au moins 1 Pokémon pour être active');
    }

    await TeamModel.setActive(userId, teamId);
  }
}
