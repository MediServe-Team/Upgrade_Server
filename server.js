require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const route = require('./src/routes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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

console.log('===== Enter Serrverr');

// set up Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Medicine API',
    summary: 'Provide a set of API for Medicine Management Application',
    version: '1.0.1',
    license: {},
    contact: {
      name: 'Medicine team',
      url: '',
    },
  },
  servers: [
    {
      url: `http://localhost:{port}`,
      variables: {
        port: {
          default: PORT,
        },
      },
    },
  ],
};
const options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, './src', '/api_docs', '*.yaml'),
    path.join(__dirname, './src', '/api_docs', '*', '*.yaml'),
  ],
  exflore: true,
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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
