import jwt from 'jsonwebtoken';
import config from '../config';
import { UserPayload } from '../types/auth.types';
import { UnauthorizedError } from '../types/errors.types';

/**
 * Génère un access token JWT
 * @param payload - Les données de l'utilisateur
 * @returns Le token JWT
 */
export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

/**
 * Génère un refresh token JWT
 * @param payload - Les données de l'utilisateur
 * @returns Le refresh token JWT
 */
export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Vérifie et décode un access token
 * @param token - Le token à vérifier
 * @returns Le payload décodé
 * @throws UnauthorizedError si le token est invalide
 */
export function verifyAccessToken(token: string): UserPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expiré');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Token invalide');
    }
    throw new UnauthorizedError('Erreur de vérification du token');
  }
}

/**
 * Vérifie et décode un refresh token
 * @param token - Le refresh token à vérifier
 * @returns Le payload décodé
 * @throws UnauthorizedError si le token est invalide
 */
export function verifyRefreshToken(token: string): UserPayload {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as UserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expiré');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Refresh token invalide');
    }
    throw new UnauthorizedError('Erreur de vérification du refresh token');
  }
}

/**
 * Calcule la date d'expiration d'un token
 * @param expiresIn - Durée de validité (ex: '1h', '7d')
 * @returns La date d'expiration
 */
export function calculateTokenExpiration(expiresIn: string): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  
  if (!match) {
    throw new Error('Format de durée invalide');
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 's':
      now.setSeconds(now.getSeconds() + value);
      break;
  }

  return now;
}
