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
  defaultCounty,
  defaultTract,
  savedProps,
} = require("./mockData");
const { transformStats } = require('./transformStats')
const fetch = require("node-fetch");
const {
  CENSUS_API_KEY,
  MAPBOX_API_KEY,
  NODE_ENV,
  CLIENT_ORIGIN,
} = require("./config");

const app = express();

// Create middleware logic

// const allowedOrigins = [CLIENT_ORIGIN, 'http://localhost:3000/']
// var corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

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
// app.use(cors(corsOptions));
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
    userLocation = userLocation !== "" ? userLocation : "Philadelphia, PA";
    const endPointURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation}.json`;
    const params = {
      limit: 1,
      fuzzyMatch: true,
      bbox: '-76.23327974765701, 39.290566999999996, -74.389708, 40.608579999999996',
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
        const lat = data.features[0].center[1];
        const lng = data.features[0].center[0];

        // Retrieve Census FIPS codes for the given coordinates

        return fetch(
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
            const fipsCodes = data.features[0].attributes;
            let geoTags = {
              lat,
              lng,
              fipsCodes,
              stateGeoid: fipsCodes["STATE"],
              countyGeoid: fipsCodes["COUNTY"],
              tractGeoid: fipsCodes["TRACT"],
              combinedGeoid: fipsCodes["STATE"] + fipsCodes["COUNTY"] + fipsCodes["TRACT"],
            };
            return geoTags;
          });

      })
      .then((geoTags) => {

        const statsVars = [
          "DP05_0001E",
          "DP03_0027PE",
          "DP03_0028PE",
          "DP03_0029PE",
          "DP03_0030PE",
          "DP03_0031PE",
          "DP03_0033PE",
          "DP03_0034PE",
          "DP03_0035PE",
          "DP03_0036PE",
          "DP03_0037PE",
          "DP03_0038PE",
          "DP03_0039PE",
          "DP03_0040PE",
          "DP03_0041PE",
          "DP03_0042PE",
          "DP03_0043PE",
          "DP03_0044PE",
          "DP03_0045PE",
          "DP03_0062E",
          "DP04_0134E",
          "DP04_0089E",
          "DP05_0018E",
          "DP05_0039PE",
          "DP05_0044PE",
          "DP05_0038PE",
          "DP05_0052PE",
          "DP05_0057PE",
          "DP05_0058PE",
          "DP05_0037PE",
          "DP03_0009PE",
          "DP04_0005E",
        ]
          
        const countyArgs = {
          sourcePath: ["acs", "acs5", "profile"],
          vintage: 2019,
          values: statsVars,
          geoHierarchy: {
            state: geoTags.stateGeoid,
            county: geoTags.countyGeoid,
          },
          geoResolution: "5m",
          statsKey: CENSUS_API_KEY,
        };


        const tractArgs = {
          sourcePath: ["acs", "acs5", "profile"],
          vintage: 2019,
          values: statsVars,
          geoHierarchy: {
            state: geoTags.stateGeoid,
            county: geoTags.countyGeoid,
            tract: geoTags.tractGeoid,
          },
          geoResolution: "500k",
          statsKey: CENSUS_API_KEY,
        };

        function censusGeoids() {
          return new Promise((resolve, reject) => {
            resolve(geoTags.fipsCodes)
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

        function censusTractPromise(args = tractArgs) {
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


        Promise.all([countyPromise(), censusGeoids(), censusTractPromise()])
          .then((values) => {

            const msaLocations = {
              states: ["10", "24", "34", "42"],
              counties: ["003", "005", "007", "015", "017", "029", "033", "045", "091", "101"]
            }
            const { states, counties } = msaLocations;
            const isInMSA = states.includes(values[1]["STATE"]) && counties.includes(values[1]["COUNTY"]);

            // If the request falls outside of MSA
            let badRequest = false;

            // Check if searched location is in MSA; if not replace with default 
            // location / stats; set badRequest to true
            if (!isInMSA) {
              values[0] = defaultCounty;
              values[2] = defaultTract;
              badRequest = true;
            }

            const statsObject = {
              msa: phillyMSAGeoJson.features[0].properties,
              county: values[0].features[0].properties,
              tract: values[2].features[0].properties,
            }

            const transformedStats = transformStats(statsObject);
            console.log(transformedStats.economic[0])
            console.log(transformedStats.demographic[1])

            
            res.json({
              badRequest,
              apiStatistics: {
                msaStats: phillyMSAGeoJson.features[0].properties,
                countyStats: values[0].features[0].properties,
                tractStats: values[2].features[0].properties,
              },
              fakeStats,
              fakeProps,
              msa: phillyMSAGeoJson,
              county: values[0],
              tract: values[2],

            });
          })
          .catch((error) => {
            throw new Error(error)
          });
      })
      .catch((error) => {
        console.error(error);
      });
  }
  getData(req.query.address);
});

module.exports = app;
