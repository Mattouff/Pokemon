import { Router } from 'express';
import { BattleController } from '../controllers/battle.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Combats interactifs
router.post('/interactive', BattleController.createInteractiveBattle);
router.get('/interactive/:battleId', BattleController.getBattle);
router.post('/interactive/:battleId/action', BattleController.performAction);
router.post('/interactive/:battleId/flee', BattleController.fleeBattle);

// Combats fantômes (ancienne API)
router.post('/ghost', BattleController.startGhostBattle);
router.get('/history', BattleController.getBattleHistory);
router.get('/stats', BattleController.getUserStats);

export default router;
