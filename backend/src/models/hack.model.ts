import db from '../config/database';
import { Hack } from '../types/hack.types';

export class HackModel {
  static async findAll(): Promise<Hack[]> {
    const query = 'SELECT * FROM hacks ORDER BY difficulty, id';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id: number): Promise<Hack | null> {
    const query = 'SELECT * FROM hacks WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByDifficulty(difficulty: string): Promise<Hack[]> {
    const query = 'SELECT * FROM hacks WHERE difficulty = $1';
    const result = await db.query(query, [difficulty]);
    return result.rows;
  }

  static async getRandomHack(): Promise<Hack> {
    const query = 'SELECT * FROM hacks ORDER BY RANDOM() LIMIT 1';
    const result = await db.query(query);
    return result.rows[0];
  }

  static async verifySolution(hackId: number, userAnswer: string): Promise<boolean> {
    const query = 'SELECT solution FROM hacks WHERE id = $1';
    const result = await db.query(query, [hackId]);
    
    if (!result.rows[0]) return false;
    
    const correctSolution = result.rows[0].solution.toUpperCase();
    return userAnswer.toUpperCase() === correctSolution;
  }
}
