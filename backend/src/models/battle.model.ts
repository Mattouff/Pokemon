import db from '../config/database';
import { Battle, BattleLog } from '../types/battle.types';

export class BattleModel {
  static async create(
    attackerId: number,
    defenderId: number,
    attackerTeamId: number,
    defenderTeamId: number,
    winnerId: number | null,
    battleLog: BattleLog,
    isGhostBattle: boolean = true
  ): Promise<Battle> {
    const query = `
      INSERT INTO battles (
        attacker_id, 
        defender_id, 
        attacker_team_id, 
        defender_team_id, 
        winner_id, 
        battle_log,
        is_ghost_battle
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await db.query(query, [
      attackerId,
      defenderId,
      attackerTeamId,
      defenderTeamId,
      winnerId,
      JSON.stringify(battleLog),
      isGhostBattle,
    ]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Battle | null> {
    const query = 'SELECT * FROM battles WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getUserBattles(userId: number, limit: number = 20): Promise<Battle[]> {
    const query = `
      SELECT * FROM battles 
      WHERE attacker_id = $1 OR defender_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  static async getUserBattlesWithDetails(userId: number, limit: number = 20): Promise<any[]> {
    const query = `
      SELECT 
        b.*,
        CASE 
          WHEN b.attacker_id = $1 THEN defender_user.username
          ELSE attacker_user.username
        END as opponent_username,
        CASE 
          WHEN b.attacker_id = $1 THEN attacker_team.name
          ELSE defender_team.name
        END as user_team_name
      FROM battles b
      LEFT JOIN users attacker_user ON b.attacker_id = attacker_user.id
      LEFT JOIN users defender_user ON b.defender_id = defender_user.id
      LEFT JOIN teams attacker_team ON b.attacker_team_id = attacker_team.id
      LEFT JOIN teams defender_team ON b.defender_team_id = defender_team.id
      WHERE b.attacker_id = $1 OR b.defender_id = $1 
      ORDER BY b.created_at DESC 
      LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  static async getUserStats(userId: number): Promise<{ wins: number; losses: number; draws: number }> {
    const query = `
      SELECT 
        COUNT(CASE WHEN winner_id = $1 THEN 1 END) as wins,
        COUNT(CASE WHEN winner_id IS NOT NULL AND winner_id != $1 THEN 1 END) as losses,
        COUNT(CASE WHEN winner_id IS NULL THEN 1 END) as draws
      FROM battles
      WHERE attacker_id = $1 OR defender_id = $1
    `;
    const result = await db.query(query, [userId]);
    return {
      wins: parseInt(result.rows[0].wins),
      losses: parseInt(result.rows[0].losses),
      draws: parseInt(result.rows[0].draws),
    };
  }
}
