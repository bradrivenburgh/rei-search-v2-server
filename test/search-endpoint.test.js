const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { cannedResponse, makeMaliciousSearch } = require("./search.fixtures");

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
    // beforeEach(() => {
    //   this.get = sinon.stub(supertest(), 'get');
    // });

    // afterEach(() => {
    //   supertest().get.restore();
    // });

    context(`Given an empty query string`, () => {
      it("responds with 200 and defaults to statistics and properties in Philadelphia", () => {
        return supertest(app)
          .get("/api/search")
          .query('address=""')
          .expect(200)
          .then((res) => {
            expect(res.badRequest).to.equal(false);
          });
      }).timeout(15000);

      // it.only('responds with 200 using stub', (done) => {
      //   this.get = sinon.stub(supertest(app), 'get');
      //   this.get.yields(null, cannedResponse.all.success.res, JSON.stringify(cannedResponse.all.success.body));

      //   supertest(app)
      //     .get('/api/search')
      //     .query('address=""')
      //     .expect(200)
      //     .end(done)

      // }).timeout(15000)
    });
  });
});
