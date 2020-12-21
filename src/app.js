require('dotenv').config();
const express = require('express');
const { logger } = require('../logger');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');


const app = express();

// Create middleware logic

// Define morgan options
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// Define validation function
function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
}

// Define error handler
function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response);
}

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
// app.use(express.json()); // Enable if using non-GET endpoints
// app.use(validateBearerToken); // Enable after adding validation
// Routers can go here
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello, boilerplate!');
});

module.exports = app;