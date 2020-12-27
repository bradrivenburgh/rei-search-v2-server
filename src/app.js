require("dotenv").config();
const express = require("express");
const { logger } = require("./logger");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const census = require("citysdk");
const {
  fakeStats,
  fakeProps,
  phillyMSAGeoJson,
  singleTractShape,
  savedProps,
} = require("./mockData");
const exampleTractShapes = require("./tract.json");
const fetch = require("node-fetch");
const {
  CENSUS_API_KEY,
  MAPBOX_API_KEY,
  NODE_ENV,
  CLIENT_ORIGIN,
} = require("./config");

const app = express();

// Create middleware logic

// Define morgan options
const morganOption = NODE_ENV === "production" ? "tiny" : "common";

// Define validation function
function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
}

// Define error handler
function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
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

/** Route Handlers */

app.get("/api/", (req, res) => {


  function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    );
    return queryItems.join("&");
  }

  //Retrieve coordinates from MapBox

  function getData(userLocation) {
    userLocation = userLocation !== '' ? userLocation : 'Philadelphia, PA'
    const endPointURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation}.json`;
    const params = {
      limit: 1,
      access_token: MAPBOX_API_KEY,
    };
    const queryString = formatQueryParams(params);
    const url = endPointURL + "?" + queryString;
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then((data) => {
        const coordinates = {
          lat: data.features[0].center[1],
          lng: data.features[0].center[0],
        };

        return coordinates;
      })
      .then((coordinates) => {
        const { lat, lng } = coordinates;

        const countyArgs = {
          vintage: 2018,
          geoHierarchy: {
            county: {
              lat,
              lng,
            },
          },
          geoResolution: "5m",
          sourcePath: ["cbp"],
          values: ["EMP"],
          statsKey: CENSUS_API_KEY,
        };

        const censusTractArgs = {
          vintage: 2019,
          geoHierarchy: {
            tract: {
              lat,
              lng,
            },
          },
          geoResolution: "500k",
          sourcePath: ["acs", "acs5", "profile", "variables"],
          values: ["NAME", "DP02_0002E"],
          statsKey: CENSUS_API_KEY,
        };

        function censusTractGEOID() {
          return new Promise((resolve, reject) => {
            fetch(
              `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2019/Mapserver/8/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4269&spatialRel=esriSpatialRelIntersects&returnGeometry=false&f=pjson&outFields=STATE,COUNTY,TRACT`
            )
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error(response.statusText);
                }
              })
              .then((data) => {
                resolve(data.features[0].attributes);
              })
              .catch((error) => {
                reject(error);
              });
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

        Promise.all([countyPromise(), censusTractGEOID(), censusTractPromise()])
          .then((values) => {
            const tract = values[2].features.find(
              (feature) =>
                feature.properties["TRACTCE"] === values[1]["TRACT"] &&
                feature.properties["COUNTYFP"] === values[1]["COUNTY"]
            );
            singleTractShape.features[0] = tract;

            res.json({
              fakeStats,
              fakeProps,
              philadelphiaPlaceGeoJson: values[0],
              phillyMSAGeoJson,
              phillyTractGeoJson: singleTractShape,
            });
          })
          .catch((error) => {
            console.error(error);
          });
      });
  }
  getData(req.query.address);
});

module.exports = app;
