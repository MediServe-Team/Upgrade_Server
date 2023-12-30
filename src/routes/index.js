import authRouter from './auth.route.js';
import categoryRouter from './category.route.js';
import productRouter from './product.route.js';
import invoiceIntoStockRouter from './invoiceIntoStock.route.js';
import unitRouter from './unit.route.js';
import itemInStockRouter from './itemInStock.route.js';
import itemRouter from './item.route.js';
import medicineRouter from './medicine.route.js';
import meRouter from './me.route.js';
import userRouter from './user.route.js';
import prescriptionRouter from './prescription.route.js';
import receiptRouter from './receipt.route.js';
import checkinRouter from '../routes/v2/checkin.route.js';
import blogRouter from '../routes/v2/blog.route.js';

function route(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/products', productRouter);
  app.use('/api/invoice-into-stocks', invoiceIntoStockRouter);
  app.use('/api/units', unitRouter);
  app.use('/api/item-in-stocks', itemInStockRouter);
  app.use('/api/items', itemRouter);
  app.use('/api/medicines', medicineRouter);
  app.use('/api/me', meRouter);
  app.use('/api/users', userRouter);
  app.use('/api/prescriptions', prescriptionRouter);
  app.use('/api/receipts', receiptRouter);
  app.use('/api/checkins', checkinRouter);
  app.use('/api/blogs', blogRouter);
}

export default route;
