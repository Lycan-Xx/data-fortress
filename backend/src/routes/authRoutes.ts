import { Router } from 'express';
import { setup, login, getStatus } from '../controllers/authController';

const router = Router();

router.get('/status', getStatus);
router.post('/setup', setup);
router.post('/login', login);

export default router;
