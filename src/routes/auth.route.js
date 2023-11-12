import express from 'express';
const router = express.Router();
import authControllers from '../controllers/auth.controller.js';

router.post('/register', authControllers.register);

router.post('/login', authControllers.login);

router.delete('/logout', authControllers.logout);

router.post('/refreshToken', authControllers.refreshToken);

export default router;
