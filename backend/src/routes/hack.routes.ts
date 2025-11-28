import { Router } from 'express';
import { HackController } from '../controllers/hack.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', HackController.getAllHacks);
router.get('/pending', HackController.getPendingHacks);
router.post('/submit', HackController.submitSolution);
router.get('/stats', HackController.getUserStats);

export default router;
