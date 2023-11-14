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

//! can use: ADMIN
//* [PUT] /users/update-info/:id     -> Edit an user by id
router.put('/update-user-info/:id', verifyAccessToken, verifyAdminAccess, userController.editUser);

//! verify ADMIN
//* [DELETE] /users/:id      -> Delete an user by id
router.delete('/:id', verifyAccessToken, verifyAdminAccess, userController.deleteUser);

//! can use: ADMIN
//* [PUT] /users/change-role/:id    -> Change role  of user by id
router.put('/change-role/:id', verifyAccessToken, verifyAdminAccess, userController.changeRole);

export default router;
