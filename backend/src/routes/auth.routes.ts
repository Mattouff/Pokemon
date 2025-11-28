import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.utils';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir l'access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion (révoque le refresh token)
 * @access  Public
 */
router.post('/logout', validate(refreshTokenSchema), AuthController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Déconnexion de tous les appareils
 * @access  Private
 */
router.post('/logout-all', authenticate, AuthController.logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir l'utilisateur courant
 * @access  Private
 */
router.get('/me', authenticate, AuthController.me);

export default router;
