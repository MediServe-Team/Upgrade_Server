import authRouter from './auth.route.js';
import categoryRouter from './category.route.js';
import productRouter from './product.route.js';
import invoiceIntoStockRouter from './invoiceIntoStock.route.js';
import unitRouter from './unit.route.js';

function route(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/products', productRouter);
  app.use('/api/invoice-into-stocks', invoiceIntoStockRouter);
  app.use('/api/units', unitRouter);
}

export default route;
