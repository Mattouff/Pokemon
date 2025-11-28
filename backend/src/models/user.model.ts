import db from '../config/database';
import { User, UserPayload } from '../types/auth.types';

export class UserModel {
  /**
   * Crée un nouvel utilisateur
   */
  static async create(username: string, email: string, passwordHash: string): Promise<User> {
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [username, email, passwordHash]);
    return result.rows[0];
  }

  /**
   * Trouve un utilisateur par email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Trouve un utilisateur par nom d'utilisateur
   */
  static async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0] || null;
  }

  /**
   * Trouve un utilisateur par ID
   */
  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Vérifie si un email existe déjà
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows.length > 0;
  }

  /**
   * Vérifie si un nom d'utilisateur existe déjà
   */
  static async usernameExists(username: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows.length > 0;
  }

  /**
   * Met à jour la date de dernière modification
   */
  static async updateLastModified(id: number): Promise<void> {
    const query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    await db.query(query, [id]);
  }

  /**
   * Convertit un User en UserPayload (sans données sensibles)
   */
  static toPayload(user: User): UserPayload {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
