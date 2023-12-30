import express from 'express';
const router = express.Router();
import blogController from '../../controllers/v2/blog.controller.js';
import { verifyAccessToken } from '../../helpers/jwt.service.js';

router.post('/create', verifyAccessToken, blogController.createBlog);

export default router;
