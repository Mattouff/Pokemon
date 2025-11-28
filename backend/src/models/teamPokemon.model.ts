import db from '../config/database';
import { TeamPokemon } from '../types/team.types';

export class TeamPokemonModel {
  static async add(teamId: number, pokemonId: number, position: number, nickname?: string): Promise<TeamPokemon> {
    const query = `
      INSERT INTO team_pokemons (team_id, pokemon_id, position, nickname)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [teamId, pokemonId, position, nickname || null]);
    return result.rows[0];
  }

  static async remove(teamId: number, pokemonId: number): Promise<void> {
    const query = 'DELETE FROM team_pokemons WHERE team_id = $1 AND pokemon_id = $2';
    await db.query(query, [teamId, pokemonId]);
  }

  static async removeByPosition(teamId: number, position: number): Promise<void> {
    const query = 'DELETE FROM team_pokemons WHERE team_id = $1 AND position = $2';
    await db.query(query, [teamId, position]);
  }

  static async getByTeam(teamId: number): Promise<TeamPokemon[]> {
    const query = 'SELECT * FROM team_pokemons WHERE team_id = $1 ORDER BY position';
    const result = await db.query(query, [teamId]);
    return result.rows;
  }

  static async count(teamId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM team_pokemons WHERE team_id = $1';
    const result = await db.query(query, [teamId]);
    return parseInt(result.rows[0].count);
  }

  static async exists(teamId: number, pokemonId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM team_pokemons WHERE team_id = $1 AND pokemon_id = $2';
    const result = await db.query(query, [teamId, pokemonId]);
    return result.rows.length > 0;
  }

  static async positionExists(teamId: number, position: number): Promise<boolean> {
    const query = 'SELECT 1 FROM team_pokemons WHERE team_id = $1 AND position = $2';
    const result = await db.query(query, [teamId, position]);
    return result.rows.length > 0;
  }

  static async updateNickname(teamId: number, pokemonId: number, nickname: string): Promise<TeamPokemon> {
    const query = `
      UPDATE team_pokemons 
      SET nickname = $1 
      WHERE team_id = $2 AND pokemon_id = $3 
      RETURNING *
    `;
    const result = await db.query(query, [nickname, teamId, pokemonId]);
    return result.rows[0];
  }
}
