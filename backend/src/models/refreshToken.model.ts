import db from '../config/database';
import { RefreshToken } from '../types/auth.types';

export class RefreshTokenModel {
  /**
   * Crée un nouveau refresh token
   */
  static async create(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [userId, token, expiresAt]);
    return result.rows[0];
  }

  /**
   * Trouve un refresh token par sa valeur
   */
  static async findByToken(token: string): Promise<RefreshToken | null> {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND is_revoked = FALSE
    `;
    const result = await db.query(query, [token]);
    return result.rows[0] || null;
  }

  /**
   * Révoque un refresh token
   */
  static async revoke(token: string): Promise<void> {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE, revoked_at = CURRENT_TIMESTAMP
      WHERE token = $1
    `;
    await db.query(query, [token]);
  }

  /**
   * Révoque tous les tokens d'un utilisateur
   */
  static async revokeAllForUser(userId: number): Promise<void> {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE, revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_revoked = FALSE
    `;
    await db.query(query, [userId]);
  }

  /**
   * Supprime les tokens expirés
   */
  static async deleteExpired(): Promise<number> {
    const query = `
      DELETE FROM refresh_tokens
      WHERE expires_at < CURRENT_TIMESTAMP
        OR (is_revoked = TRUE AND revoked_at < CURRENT_TIMESTAMP - INTERVAL '30 days')
      RETURNING *
    `;
    const result = await db.query(query);
    return result.rowCount || 0;
  }

  /**
   * Vérifie si un token est valide (non révoqué et non expiré)
   */
  static async isValid(token: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM refresh_tokens
      WHERE token = $1 
        AND is_revoked = FALSE 
        AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await db.query(query, [token]);
    return result.rows.length > 0;
  }
}
