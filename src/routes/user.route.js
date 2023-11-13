import express from 'express';
const router = express.Router();
import userController from '../controllers/user.controller.js';
import { verifyAccessToken, verifyAdminAccess } from '../helpers/jwt.service.js';

//! can use: ADMIN
//* [GET] /users/all     -> Get all user
router.get('/all', verifyAccessToken, verifyAdminAccess, userController.getAllUser);

export default router;
