import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon.controller';

const router = Router();

router.get('/', PokemonController.getList);
router.get('/search', PokemonController.search);
router.get('/:id', PokemonController.getById);

export default router;
