import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { UnauthorizedError } from '../types/errors.types';
import { verifyAccessToken } from '../utils/jwt.utils';
import db from '../config/database';

/**
 * Middleware d'authentification - Vérifie le token JWT
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token d\'authentification manquant');
    }

    const token = authHeader.substring(7);

    const payload = verifyAccessToken(token);

    (req as AuthRequest).user = payload;


    await db.query(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
      [payload.id]
    );

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware d'authentification optionnelle
 * N'échoue pas si le token est absent, mais le valide s'il est présent
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      (req as AuthRequest).user = payload;
      
      await db.query(
        'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
        [payload.id]
      );
    }

    next();
  } catch (error) {
    next();
  }
}
