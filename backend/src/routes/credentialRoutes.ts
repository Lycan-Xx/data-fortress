import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getAll, create, update, remove, reveal } from '../controllers/credentialController';

const router = Router();

router.use(authMiddleware as any);

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.get('/:id/reveal', reveal);

export default router;
