import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';
import { ForbiddenError } from '../types/errors.types';

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        throw new ForbiddenError('Authentification requise');
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError('Vous n\'avez pas les permissions nécessaires');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function authorizeOwnerOrAdmin(userIdParam: string = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        throw new ForbiddenError('Authentification requise');
      }

      const resourceUserId = parseInt(req.params[userIdParam]);

      if (user.role === 'admin' || user.id === resourceUserId) {
        next();
      } else {
        throw new ForbiddenError('Accès non autorisé à cette ressource');
      }
    } catch (error) {
      next(error);
    }
  };
}
