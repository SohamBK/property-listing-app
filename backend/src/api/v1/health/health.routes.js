import { Router } from 'express';
import { healthCheck, protectedHealthCheck } from './health.controller.js';
import {
    authenticate,
    authorize,
} from '../../../middleware/auth.middleware.js';

const router = Router();

router.get('/', healthCheck);

router.get(
    '/protected',
    authenticate,
    authorize(['agent']),
    protectedHealthCheck
);

export default router;
