const express = require("express");
const fetch = require("node-fetch");
const xss = require("xss");
const { logger } = require("../logger");
const census = require("citysdk");
const { transformStats } = require("./transformStats");
const {
  phillyMSAGeoJson,
  defaultCounty,
  defaultTract,
  savedProps,
} = require("../mockData");
const { CENSUS_API_KEY, MAPBOX_API_KEY } = require("../config");
const { ValidationService } = require("../ValidationService");
const { requiredDictionary, customInvalidPropsMessages } = require("../callerValidationData");

const SearchService = require("./search-service");
const searchRouter = express.Router();
const knex = (req) => req.app.get('db');

const serializeSearch = (query) => xss(query);

searchRouter.route("/search").get((req, res, next) => {
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
      bbox:
        "-76.23327974765701, 39.290566999999996, -74.389708, 40.608579999999996",
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
        let lat, lng;
        console.log(data)
        if (data.features.length === 0) {
          lat = 40.010854;
          lng = -75.126666;
        } else {
          lat = data.features[0].center[1];
          lng = data.features[0].center[0];  
        }

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
              combinedGeoid:
                fipsCodes["STATE"] + fipsCodes["COUNTY"] + fipsCodes["TRACT"],
            };
            return geoTags;
          });
      })
      .then((geoTags) => {
        const acsVars = [
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
        ];

        const countyAcsArgs = {
          sourcePath: ["acs", "acs5", "profile"],
          vintage: 2019,
          values: acsVars,
          geoHierarchy: {
            state: geoTags.stateGeoid,
            county: geoTags.countyGeoid,
          },
          geoResolution: "5m",
          statsKey: CENSUS_API_KEY,
        };

        const tractAcsArgs = {
          sourcePath: ["acs", "acs5", "profile"],
          vintage: 2019,
          values: acsVars,
          geoHierarchy: {
            state: geoTags.stateGeoid,
            county: geoTags.countyGeoid,
            tract: geoTags.tractGeoid,
          },
          geoResolution: "500k",
          statsKey: CENSUS_API_KEY,
        };

        const countyPepArgs = {
          sourcePath: ["pep", "population"],
          vintage: 2019,
          values: ["DATE_CODE", "DATE_DESC", "POP"],
          geoHierarchy: {
            state: geoTags.stateGeoid,
            county: geoTags.countyGeoid,
          },
          statsKey: CENSUS_API_KEY,
        };

        function censusGeoids() {
          return new Promise((resolve, reject) => {
            resolve(geoTags);
          });
        }

        function countyAcs(args = countyAcsArgs) {
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

        function countyPep(args = countyPepArgs) {
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

        function ctAcsPromise(args = tractAcsArgs) {
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

        Promise.all([countyAcs(), censusGeoids(), ctAcsPromise(), countyPep()])
          .then((values) => {
            const msaLocations = {
              states: ["10", "24", "34", "42"],
              counties: [
                "003",
                "005",
                "007",
                "015",
                "017",
                "029",
                "033",
                "045",
                "091",
                "101",
              ],
            };
            const { states, counties } = msaLocations;
            const isInMSA =
              states.includes(values[1].fipsCodes["STATE"]) &&
              counties.includes(values[1].fipsCodes["COUNTY"]);

            // If the request falls outside of MSA
            let badRequest = false;
            let searchLocation = `${values[1].lng},${values[1].lat}`;

            // Check if searched location is in MSA; if not replace with default
            // location / stats; set badRequest to true
            if (!isInMSA) {
              values[0] = defaultCounty;
              values[2] = defaultTract;
              searchLocation = `-75.126666,40.010854`;
              badRequest = true;
            }

            const statistics = {
              msa: phillyMSAGeoJson.features[0].properties,
              county: values[0].features[0].properties,
              countyPep: values[3],
              tract: values[2].features[0].properties,
            };

            SearchService.getProperties(knex(req), searchLocation).then(
              (properties) => {
                const simplifiedArr = properties.map((property) => {
                  return property.property;
                });
                 return res.json({
                  badRequest,
                  apiStatistics: transformStats(statistics),
                  properties: simplifiedArr,
                  msa: phillyMSAGeoJson,
                  county: values[0],
                  tract: values[2],
                });
              }
            );
          })
          .catch((error) => {
            throw new Error(error);
          });
      })
      .catch((error) => {
        logger.error(error);
        console.error(error);
      });
  }
  getData(serializeSearch(req.query.address));
});

module.exports = searchRouter;
