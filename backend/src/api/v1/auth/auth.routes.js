import { Router } from 'express';

import { login, refresh, logout, register } from './auth.controller.js';
import { validateLogin, validateRegister } from './auth.validation.js';

const router = Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
