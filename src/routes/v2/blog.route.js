import express from 'express';
const router = express.Router();
import blogController from '../../controllers/v2/blog.controller.js';
import { verifyAccessToken } from '../../helpers/jwt.service.js';

router.post('/create', verifyAccessToken, blogController.createBlog);

router.put('/update/:id', verifyAccessToken, blogController.updateBlog);

router.delete('/delete/:id', verifyAccessToken, blogController.deleteBlog);

router.get('/view-all', blogController.getAllBlog);

router.get('/detail/:id', blogController.getDetailBlog);

router.get('/all', blogController.getAllBlogWithFilter);

export default router;
