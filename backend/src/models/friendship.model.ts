import db from '../config/database';
import { Friendship, FriendshipStatus, FriendWithDetails } from '../types/friendship.types';

export class FriendshipModel {
  static async create(userId: number, friendId: number): Promise<Friendship> {
    const query = `
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
    `;
    const result = await db.query(query, [userId, friendId]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Friendship | null> {
    const query = 'SELECT * FROM friendships WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUsers(userId: number, friendId: number): Promise<Friendship | null> {
    const query = `
      SELECT * FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) 
         OR (user_id = $2 AND friend_id = $1)
    `;
    const result = await db.query(query, [userId, friendId]);
    return result.rows[0] || null;
  }

  static async getFriends(userId: number, status?: FriendshipStatus): Promise<FriendWithDetails[]> {
    let query = `
      SELECT 
        u.id,
        f.id as friendship_id,
        u.username,
        u.email,
        f.status,
        f.created_at,
        COALESCE(t.teams_count, 0)::integer as teams_count,
        COALESCE(b.total_battles, 0)::integer as total_battles,
        CASE 
          WHEN u.last_seen > NOW() - INTERVAL '5 minutes' THEN TRUE 
          ELSE FALSE 
        END as is_online,
        COALESCE(at.has_active_team, FALSE) as has_active_team
      FROM friendships f
      INNER JOIN users u ON (
        CASE 
          WHEN f.user_id = $1 THEN u.id = f.friend_id
          ELSE u.id = f.user_id
        END
      )
      LEFT JOIN (
        SELECT user_id, COUNT(*) as teams_count
        FROM teams
        GROUP BY user_id
      ) t ON u.id = t.user_id
      LEFT JOIN (
        SELECT user_id, SUM(battle_count)::integer as total_battles
        FROM (
          SELECT attacker_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY attacker_id
          UNION ALL
          SELECT defender_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY defender_id
        ) battles_union
        GROUP BY user_id
      ) b ON u.id = b.user_id
      LEFT JOIN (
        SELECT t.user_id, TRUE as has_active_team
        FROM teams t
        INNER JOIN team_pokemons tp ON t.id = tp.team_id
        WHERE t.is_active = true
        GROUP BY t.user_id
        HAVING COUNT(tp.id) > 0
      ) at ON u.id = at.user_id
      WHERE (f.user_id = $1 OR f.friend_id = $1)
    `;

    const params: any[] = [userId];

    if (status) {
      query += ' AND f.status = $2';
      params.push(status);
    }

    query += ' ORDER BY f.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async getPendingRequests(userId: number): Promise<FriendWithDetails[]> {
    const query = `
      SELECT 
        u.id,
        f.id as friendship_id,
        u.username,
        u.email,
        f.status,
        f.created_at,
        COALESCE(t.teams_count, 0)::integer as teams_count,
        COALESCE(b.total_battles, 0)::integer as total_battles
      FROM friendships f
      INNER JOIN users u ON u.id = f.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as teams_count
        FROM teams
        GROUP BY user_id
      ) t ON u.id = t.user_id
      LEFT JOIN (
        SELECT user_id, SUM(battle_count)::integer as total_battles
        FROM (
          SELECT attacker_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY attacker_id
          UNION ALL
          SELECT defender_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY defender_id
        ) battles_union
        GROUP BY user_id
      ) b ON u.id = b.user_id
      WHERE f.friend_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async getSentRequests(userId: number): Promise<FriendWithDetails[]> {
    const query = `
      SELECT 
        u.id,
        f.id as friendship_id,
        u.username,
        u.email,
        f.status,
        f.created_at,
        COALESCE(t.teams_count, 0)::integer as teams_count,
        COALESCE(b.total_battles, 0)::integer as total_battles
      FROM friendships f
      INNER JOIN users u ON u.id = f.friend_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as teams_count
        FROM teams
        GROUP BY user_id
      ) t ON u.id = t.user_id
      LEFT JOIN (
        SELECT user_id, SUM(battle_count)::integer as total_battles
        FROM (
          SELECT attacker_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY attacker_id
          UNION ALL
          SELECT defender_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY defender_id
        ) battles_union
        GROUP BY user_id
      ) b ON u.id = b.user_id
      WHERE f.user_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async updateStatus(friendshipId: number, status: FriendshipStatus): Promise<Friendship> {
    const query = `
      UPDATE friendships 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await db.query(query, [status, friendshipId]);
    return result.rows[0];
  }

  static async delete(friendshipId: number): Promise<void> {
    const query = 'DELETE FROM friendships WHERE id = $1';
    await db.query(query, [friendshipId]);
  }

  static async areFriends(userId: number, friendId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM friendships 
      WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
        AND status = 'accepted'
    `;
    const result = await db.query(query, [userId, friendId]);
    return result.rows.length > 0;
  }

  static async isInvolved(friendshipId: number, userId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM friendships WHERE id = $1 AND (user_id = $2 OR friend_id = $2)';
    const result = await db.query(query, [friendshipId, userId]);
    return result.rows.length > 0;
  }
}
