import express from 'express';
const router = express.Router();
import authControllers from '../controllers/auth.controller.js';

router.post('/register', authControllers.register);

export default router;
