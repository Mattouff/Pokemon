import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', TeamController.create);
router.get('/', TeamController.getAll);
router.get('/:id', TeamController.getById);
router.put('/:id', TeamController.update);
router.delete('/:id', TeamController.delete);
router.post('/:id/pokemons', TeamController.addPokemon);
router.delete('/:id/pokemons/:pokemonId', TeamController.removePokemon);
router.put('/:id/active', TeamController.setActive);

export default router;
