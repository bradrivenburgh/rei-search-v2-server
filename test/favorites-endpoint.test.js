const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const {
  makeFavoritesArray,
  makeMaliciousFavorite,
} = require('./favorites.fixtures');
const helpers = require('./test-helpers');

describe('Favorites Endpoint', function () {
  let db;

  const { testUsers } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set('db', db);
  });

  before('clean tables', () => helpers.cleanTables(db));
  // before('clean favorites table', () =>
  //   db.raw('TRUNCATE favorites RESTART IDENTITY CASCADE')
  // );
  afterEach('clean tables', () => helpers.cleanTables(db));
  // afterEach('clean favorites table', () =>
  //   db.raw('TRUNCATE favorites RESTART IDENTITY CASCADE')
  // );
  after('disconnect from db', () => db.destroy());

  describe(`GET /api/favorites`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    context(`Given no properties in the favorites table`, () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/favorites')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context(`Given there are properties in the favorites table `, () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db.into('favorites').insert(testFavorites);
      });

      context(`Given an XSS attack favorite`, () => {
        const { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

        beforeEach('insert malicious favorite', () => {
          return db.into('favorites').insert([maliciousFavorite]);
        });

        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/favorites`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200)
            .expect((res) => {
              const insertedFavorite = res.body[res.body.length - 1];
              expect(insertedFavorite.property).to.eql(
                expectedFavorite.property
              );
            });
        });
      });

      it(`responds with 200 and all of the properties`, () => {
        const expectedTestFavorites = testFavorites.filter(
          (favorite) => testUsers[0].id === favorite.user_id
        );

        return supertest(app)
          .get('/api/favorites')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then((res) => {
            expect(res.body).to.eql(expectedTestFavorites);
          });
      });
    });
  });

  describe(`GET /api/favorites/:id`, () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    context(`Given no properties in the favorites table`, () => {
      it(`responds with 404`, () => {
        const id = 123456;
        return supertest(app)
          .get(`/api/favorites/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `Property does not exist` } });
      });
    });

    context(`Given there are properties in the favorites table`, () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db.into('favorites').insert(testFavorites);
      });

      context(`Given an XSS attack favorite`, () => {
        const { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

        beforeEach('insert malicious favorite', () => {
          return db.into('favorites').insert([maliciousFavorite]);
        });

        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/favorites/${maliciousFavorite.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200)
            .expect((res) => {
              expect(res.body.property).to.eql(expectedFavorite.property);
            });
        });
      });

      it(`responds with 200 and the specified property`, () => {
        const id = 1;
        const expectedFavorite = testFavorites[id - 1];
        return supertest(app)
          .get(`/api/favorites/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedFavorite);
      });
    });
  });

  describe('POST /api/favorites', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    const testFavorite = makeFavoritesArray()[0];

    it('creates a favorite, responding with 201 and the new favorite', function () {
      const newFavorite = {
        id: testFavorite.id,
        property: testFavorite.property,
      };

      return supertest(app)
        .post('/api/favorites')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newFavorite)
        .expect(201)
        .expect((res) => {
          expect(res.body.property).to.eql(newFavorite.property);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/favorites/${res.body.id}`);
        })
        .then((postRes) => {
          return supertest(app)
            .get(`/api/favorites/${postRes.body.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(postRes.body);
        });
    });

    const requiredFields = ['property', 'id'];
    requiredFields.forEach((field) => {
      const newFavorite = {
        id: 1,
        property: testFavorite.property,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFavorite[field];

        return supertest(app)
          .post('/api/favorites')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newFavorite)
          .expect(400, {
            error: { message: `Required properties are missing: ${field}` },
          });
      });
    });

    context(`Given an XSS attack favorite`, () => {
      let { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

      it('removes XSS attack content', () => {
        return supertest(app)
          .post(`/api/favorites`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(maliciousFavorite)
          .expect(201)
          .expect((res) => {
            expect(res.body.property).to.eql(expectedFavorite.property);
          });
      });
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    context('given no properties in the favorites table', () => {
      it('responds with 404', () => {
        const id = 123456;
        return supertest(app)
          .delete(`/api/favorites/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `Property does not exist` } });
      });
    });

    context('given there are properties in the favorites table', () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db.into('favorites').insert(testFavorites);
      });

      it('responds with 204 and removes the property', () => {
        const idToRemove = 1;
        const expectedFavorites = [testFavorites[0]].filter(
          (favorite) => favorite.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/favorites/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then((res) => {
            return supertest(app)
              .get('/api/favorites')
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedFavorites);
          });
      });
    });
  });
});
