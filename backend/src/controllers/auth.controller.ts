import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest, RegisterDTO, LoginDTO } from '../types/auth.types';
import { validateData } from '../utils/validation.utils';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.utils';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterDTO = validateData(registerSchema, req.body);
      const tokens = await AuthService.register(data);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDTO = validateData(loginSchema, req.body);
      const tokens = await AuthService.login(data);

      res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = validateData(refreshTokenSchema, req.body);
      const tokens = await AuthService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token rafraîchi avec succès',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = validateData(refreshTokenSchema, req.body);
      await AuthService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie',
      });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      await AuthService.logoutAll(user.id);

      res.status(200).json({
        success: true,
        message: 'Déconnexion de tous les appareils réussie',
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
