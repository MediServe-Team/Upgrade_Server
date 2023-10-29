import authRouter from './auth.route.js';

function route(app) {
  app.use('/api/auth', authRouter);
}

export default route;
