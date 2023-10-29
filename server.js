import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import createError from 'http-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import route from './src/routes/index.js';
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }),
);

app.set('trust proxy', 1);

app.use(express.json({ limit: '60mb' }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

route(app);

app.use((req, res, next) => {
  next(createError.NotFound('This route does not exist!'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
