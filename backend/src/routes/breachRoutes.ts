import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { scan } from '../controllers/breachController';

const router = Router();

router.use(authMiddleware as any);

router.post('/scan', scan);

export default router;
