import express from 'express';
const router = express.Router();
import meController from '../controllers/me.controller.js';
import { verifyAccessToken } from '../helpers/jwt.service.js';

//* [GET] /me/profile   -> Get my profile
router.get('/profile', verifyAccessToken, meController.getProfile);

//* [PUT] /me/update-info     -> Edit my profile
router.put('/update-info', verifyAccessToken, meController.updateInfo);

export default router;
