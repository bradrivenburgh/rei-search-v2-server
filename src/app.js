require('dotenv').config();
const express = require('express');
const { logger } = require('./logger');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const census = require('citysdk');
const {
  fakeStats,
  fakeProps,
  philadelphiaPlaceGeoJson,
  phillyMSAGeoJson,
  phillyTractGeoJson,
  savedProps,
} = require("./mockData");
const { CENSUS_API_KEY, NODE_ENV, CLIENT_ORIGIN } = require('./config');

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
// Enable cors when wired up to Vercel client
// app.use(cors({
//   origin: CLIENT_ORIGIN,
// }));
app.use(cors());
app.use(helmet());
// app.use(express.json()); // Enable if using non-GET endpoints
// app.use(validateBearerToken); // Enable after adding validation
// Routers can go here
app.use(errorHandler);

app.get("/api/", (req, res) => {

  const censusTractArgs = {
    vintage: 2019,
    geoHierarchy: {
      county: {
        lat: 39.9,
        lng: -75.16,
      },
      tract: {
        lat: 39.9,
        lng: -75.16,
      },
    },
    geoResolution: "500k",
    sourcePath: ["acs", "acs5", "profile", "variables"],
    values: ["NAME", "DP02_0002E"],
    statsKey: CENSUS_API_KEY,
  };

  const placeArgs = {
    vintage: 2019,
    geoHierarchy: {
      state: "42",
      place: {
        lat: 39.9,
        lng: -75.16,
      },
    },
    geoResolution: "500k",
    // sourcePath: ["acs", "acs5", "profile", "variables"],
    // values: ["NAME", "DP02_0002E"],
    statsKey: CENSUS_API_KEY,
  };


  function censusTractPromise(args = censusTractArgs) {
    return new Promise((resolve, reject) => {
      census(args, (err, json) => {
        if (!err) {
          resolve(json);
        } else {
          reject(err);
        }
      });
    });
  }

  function placePromise(args = placeArgs) {
    return new Promise((resolve, reject) => {
      census(args, (err, json) => {
        if (!err) {
          resolve(json);
        } else {
          reject(err);
        }
      });
    });
  }


  Promise.all([ placePromise(), censusTractPromise() ]).then((values) => {
    console.log(values[0], values[1])
    // res.json({
    //   fakeStats,
    //   fakeProps,
    //   philadelphiaPlaceGeoJson,
    //   phillyMSAGeoJson,
    //   phillyTractGeoJson,
    // });
  })

  res.json({
    fakeStats,
    fakeProps,
    philadelphiaPlaceGeoJson,
    phillyMSAGeoJson,
    phillyTractGeoJson,
  });

});

module.exports = app;