import db from '../config/database';
import { BattleHack } from '../types/hack.types';

export class BattleHackModel {
  static async create(
    battleId: number,
    hackId: number,
    userId: number,
    hackProbability: number
  ): Promise<BattleHack> {
    const query = `
      INSERT INTO battle_hacks (battle_id, hack_id, user_id, hack_probability)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [battleId, hackId, userId, hackProbability]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<BattleHack | null> {
    const query = 'SELECT * FROM battle_hacks WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByBattle(battleId: number): Promise<BattleHack[]> {
    const query = 'SELECT * FROM battle_hacks WHERE battle_id = $1';
    const result = await db.query(query, [battleId]);
    return result.rows;
  }

  static async findPendingByUser(userId: number): Promise<BattleHack[]> {
    const query = `
      SELECT * FROM battle_hacks 
      WHERE user_id = $1 AND is_solved = FALSE 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async submitSolution(
    battleHackId: number,
    userAnswer: string,
    isCorrect: boolean
  ): Promise<BattleHack> {
    const query = `
      UPDATE battle_hacks 
      SET user_answer = $1, 
          is_solved = $2, 
          attempted_at = CURRENT_TIMESTAMP,
          solved_at = CASE WHEN $2 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = $3 
      RETURNING *
    `;
    const result = await db.query(query, [userAnswer, isCorrect, battleHackId]);
    return result.rows[0];
  }

  static async getUserHackStats(userId: number): Promise<{ total: number; solved: number; failed: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_solved = TRUE THEN 1 END) as solved,
        COUNT(CASE WHEN is_solved = FALSE AND attempted_at IS NOT NULL THEN 1 END) as failed
      FROM battle_hacks
      WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return {
      total: parseInt(result.rows[0].total),
      solved: parseInt(result.rows[0].solved),
      failed: parseInt(result.rows[0].failed),
    };
  }
}
