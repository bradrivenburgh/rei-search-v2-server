require('dotenv').config();
const express = require('express');
const { logger } = require('./logger');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const { validateBearerToken } = require('./middleware/client-auth');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const searchRouter = require('./search/search-router');
const favoritesRouter = require('./favorites/favorites-router');

const app = express();

// Create middleware logic
const allowedOrigins = [CLIENT_ORIGIN, 'http://localhost:3000'];

var corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
};
// Define morgan options
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

// Define error handler
function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
}

app.use(morgan(morganOption));
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
// app.use(validateBearerToken); // Enable after adding validation
// Routers can go here
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/', searchRouter);
app.use('/api/', favoritesRouter);
app.use(errorHandler);

/** Route Handlers */

app.get('/api/', validateBearerToken, (req, res) => {
  res.status(200).end();
});

module.exports = app;
