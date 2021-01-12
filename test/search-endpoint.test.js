const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { transformStats } = require("../src/search/transformStats");
const { countyPepValues } = require("./search.fixtures");

describe("Search Endpoint", function () {
  let db;

  // Connecting to production database b/c we will only be reading information from it
  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  describe(`GET /api/search`, () => {
    let api_response;

    // context(`Given an empty query string`, () => {
    it("responds with 200 and defaults to statistics and properties in Philadelphia", () => {
      return supertest(app)
        .get("/api/search")
        .query('address=""')
        .expect(200)
        .then((res) => {
          expect(
            res.body.apiStatistics.economic[1]["CT"]
          ).to.have.lengthOf.at.least(1);
          expect(
            res.body.apiStatistics.demographic[1]["CT"]
          ).to.have.lengthOf.at.least(1);
          expect(res.body.properties).to.have.lengthOf.at.least(1);
          expect(res.body.properties[1].address.city).to.equal("Philadelphia");
          expect(res.body.properties[1].address.state).to.equal("PA");

          api_response = res;
        });
    }).timeout(15000);

    it("transformStats transforms the Census data correctly", () => {
      const data = api_response.body;
      const statistics = {
        msa: data.msa.features[0].properties,
        county: data.county.features[0].properties,
        countyPep: countyPepValues,
        tract: data.tract.features[0].properties,
      };
      expect(data.apiStatistics).to.eql(transformStats(statistics));
    });
  });

  it("responds with properties within 10k of the given coordinates in NJ", () => {
    return supertest(app)
      .get("/api/search")
      .query("address=Medford, NJ")
      .expect(200)
      .then((res) => {
        const properties = res.body.properties;
        const state = properties.some(
          (property) => property.address.state === "NJ"
        );
        expect(state).to.equal(true);
      });
  }).timeout(15000);
});
