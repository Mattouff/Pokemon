import db from '../config/database';
import { Team } from '../types/team.types';

export class TeamModel {
  static async create(userId: number, name: string): Promise<Team> {
    const query = `
      INSERT INTO teams (user_id, name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(query, [userId, name]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Team | null> {
    const query = 'SELECT * FROM teams WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUser(userId: number): Promise<Team[]> {
    const query = 'SELECT * FROM teams WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async update(id: number, name: string): Promise<Team> {
    const query = `
      UPDATE teams 
      SET name = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await db.query(query, [name, id]);
    return result.rows[0];
  }

  static async delete(id: number): Promise<void> {
    const query = 'DELETE FROM teams WHERE id = $1';
    await db.query(query, [id]);
  }

  static async setActive(userId: number, teamId: number): Promise<void> {
    await db.query('BEGIN');
    try {
      await db.query('UPDATE teams SET is_active = FALSE WHERE user_id = $1', [userId]);
      await db.query('UPDATE teams SET is_active = TRUE WHERE id = $1 AND user_id = $2', [teamId, userId]);
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async getActiveTeam(userId: number): Promise<Team | null> {
    const query = 'SELECT * FROM teams WHERE user_id = $1 AND is_active = TRUE';
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async isOwner(teamId: number, userId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM teams WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [teamId, userId]);
    return result.rows.length > 0;
  }
}
