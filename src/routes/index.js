import authRouter from './auth.route.js';
import CategoryRouter from './category.route.js';

function route(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/categories', CategoryRouter);
}

export default route;
