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
  singleTractShape,
  savedProps,
} = require("./mockData");
const exampleTractShapes = require('./tract.json');
const fetch = require('node-fetch');
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

  function censusTractGEOID() {
    return new Promise((resolve, reject) => {
      const lat = 39.979331970214844;
      const lng = -75.12352752685547;
      fetch('https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2019/Mapserver/8/query?geometry=-75.12352752685547,39.979331970214844&geometryType=esriGeometryPoint&inSR=4269&spatialRel=esriSpatialRelIntersects&returnGeometry=false&f=pjson&outFields=STATE,COUNTY,TRACT')
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(response.statusText);
        }
      })
      .then(data => {
        resolve(data.features[0].attributes)
      })
      .catch(error => {
        reject(error)
      })
    });
  }


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

  const countyArgs = {
    vintage: 2018,
    geoHierarchy: {
      'county': {
          lat: 39.9,
          lng: -75.16,
      },
  },
    geoResolution: "5m",
    sourcePath: ["cbp"],
    values: ["EMP"],
    statsKey: CENSUS_API_KEY,
  };

  function countyPromise(args = countyArgs) {
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


  Promise.all([ countyPromise(), censusTractGEOID(), censusTractPromise() ]).then((values) => {
    const tract = values[2].features.find(
      (feature) =>
        feature.properties["TRACTCE"] === values[1]["TRACT"] &&
        feature.properties["COUNTYFP"] === values[1]["COUNTY"]
    );
    console.log(singleTractShape.features)
    singleTractShape.features[0] = tract;
    res.json({
      fakeStats,
      fakeProps,
      philadelphiaPlaceGeoJson: values[0],
      phillyMSAGeoJson,
      phillyTractGeoJson: singleTractShape,
    });
  }).catch(error => {
    console.error(error);
  })
});

module.exports = app;