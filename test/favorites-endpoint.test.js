const knex = require('knex');
const app = require('../src/app');
const { 
  makeFavoritesArray, 
  makeMaliciousFavorite, 
} = require('./favorites.fixtures');

describe('Favorites Endpoint', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set('db', db);
  });

  before('clean the table', () => db.raw('TRUNCATE favorites RESTART IDENTITY CASCADE'));
  
  afterEach('cleanup', () => db.raw('TRUNCATE favorites RESTART IDENTITY CASCADE'));

  after('disconnect from db', () => db.destroy());


  describe(`GET /api/favorites`, () => {
    context(`Given no properties in the favorites table`, () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/favorites')
          //// .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context(`Given there are properties in the favorites table `, () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      context(`Given an XSS attack favorite`, () => {
        const { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

        beforeEach("insert malicious favorite", () => {
          return db.into("favorites").insert([maliciousFavorite]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/favorites`)
          ////  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect((res) => {
              const insertedFavorite = res.body[res.body.length - 1];
              expect(insertedFavorite.property).to.eql(expectedFavorite.property);
            });
        });
      });
      
      it(`responds with 200 and all of the properties`, () => {
        return supertest(app)
          .get('/api/favorites')
        ////  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testFavorites)
      });
    });
  
  });

  describe(`GET /api/favorites/:id`, () => {
    context(`Given no properties in the favorites table`, () => {
      it(`responds with 404`, () => {
        const id = 123456;
        return supertest(app)
          .get(`/api/favorites/${id}`)
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: {  message: `Property does not exist` } });
      });
    });

    context(`Given there are properties in the favorites table`, () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      context(`Given an XSS attack favorite`, () => {
        const { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

        beforeEach("insert malicious favorite", () => {
          return db.into("favorites").insert([maliciousFavorite]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/favorites/${maliciousFavorite.id}`)
          //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.property).to.eql(expectedFavorite.property)
            });
        });
      });

      it(`responds with 200 and the specified folder`, () => {
        const id = 1;
        const expectedFavorite = testFavorites[id - 1];
        return supertest(app)
          .get(`/api/favorites/${id}`)
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedFavorite)
      });
    });
  });
/*
  describe('POST /api/favorites', () => {
    it('creates a folder, responding with 201 and the new folder', function () {
      const newFolder = {
        property: 'Test new folder',
      };

      return supertest(app)
      .post('/api/favorites')
    //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send(newFolder)
      .expect(201)
      .expect(res => {
        expect(res.body.property).to.eql(newFolder.property);
        expect(res.body).to.have.property('id');
        expect(res.headers.location).to.eql(`/api/favorites/${res.body.id}`);
      })
      .then(postRes => {
        return supertest(app)
          .get(`/api/favorites/${postRes.body.id}`)
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(postRes.body)
      });
    });

    const requiredFields = ['property'];
    requiredFields.forEach(field => {
      const newFolder = {
        property: 'Test new folder',
      };
  
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field];

        return supertest(app)
          .post('/api/favorites')
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(newFolder)
          .expect(400, {
            error: { message: `Required properties are missing: ${field}` }
          });
      });
    });

    context(`Given an XSS attack favorite`, () => {
      let { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();
      maliciousFavorite = camelCaseKeys(maliciousFavorite);

      it("removes XSS attack content", () => {
        return supertest(app)
          .post(`/api/favorites`)
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(maliciousFavorite)
          .expect(201)
          .expect((res) => {
            expect(res.body.property).to.eql(expectedFavorite.property);
          });
      });
    });
  });
*/
  describe.only('DELETE /api/favorites/:id', () => {
    context('given no properties in the favorites table', () => {
      it('responds with 404', () => {
        const id = 123456;
        return supertest(app)
          .delete(`/api/favorites/${id}`)
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Property does not exist` } })
      });
    })

    context('given the are properties in the favorites table', () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const expectedFavorites = testFavorites
          .filter(folder => folder.id !== idToRemove);
        return supertest(app)
          .delete(`/api/favorites/${idToRemove}`)
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get('/api/favorites')
            //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedFavorites)
          });
      });
    });
  });

 });