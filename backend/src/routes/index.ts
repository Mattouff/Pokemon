import { Router } from 'express';
import authRoutes from './auth.routes';
import pokemonRoutes from './pokemon.routes';
import teamRoutes from './team.routes';
import friendshipRoutes from './friendship.routes';
import battleRoutes from './battle.routes';
import weatherRoutes from './weather.routes';
import hackRoutes from './hack.routes';

const router = Router();

/**
 * Routes d'authentification
 */
router.use('/auth', authRoutes);

/**
 * Routes Pokémon
 */
router.use('/pokemon', pokemonRoutes);

/**
 * Routes Teams
 */
router.use('/teams', teamRoutes);

/**
 * Routes Friends
 */
router.use('/friends', friendshipRoutes);

/**
 * Routes Battles
 */
router.use('/battles', battleRoutes);

/**
 * Routes Weather
 */
router.use('/weather', weatherRoutes);

/**
 * Routes Hacks
 */
router.use('/hacks', hackRoutes);

/**
 * Route de santé
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API opérationnelle',
    timestamp: new Date().toISOString(),
  });
});

export default router;
