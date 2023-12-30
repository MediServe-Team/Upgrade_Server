import blogServices from '../../services/v2/blog.service.js';

export default {
  createBlog: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const dataInvo = req.body;
      dataInvo.userId = userId;

      await blogServices.createBlog(dataInvo);

      res.status(200).json({
        status: 200,
        message: 'create success',
      });
    } catch (err) {
      next(err);
    }
  },
};
