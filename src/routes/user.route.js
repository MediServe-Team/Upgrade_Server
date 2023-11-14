import express from 'express';
const router = express.Router();
import userController from '../controllers/user.controller.js';
import { verifyAccessToken, verifyAdminAccess } from '../helpers/jwt.service.js';

//! can use: ADMIN
//* [GET] /users/all     -> Get all user
router.get('/all', verifyAccessToken, verifyAdminAccess, userController.getAllUser);

//! can use: ADMIN
//* [GET] /users/:id     -> Get an user by id
router.get('/:id', verifyAccessToken, verifyAdminAccess, userController.getUser);

//! verify ADMIN
//* [DELETE] /users/:id      -> Delete an user by id
router.delete('/:id', verifyAccessToken, verifyAdminAccess, userController.deleteUser);

export default router;
