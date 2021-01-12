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
          // .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context.only(`Given there are properties in the favorites table `, () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert favorites', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      context(`Given an XSS attack folder`, () => {
        const { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

        beforeEach("insert malicious folder", () => {
          return db.into("favorites").insert([maliciousFavorite]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/favorites`)
          //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect((res) => {
              const insertedFavorite = res.body[res.body.length - 1];
              expect(insertedFavorite.property).to.eql(expectedFavorite.property);
            });
        });
      });
      
      it(`responds with 200 and all of the folders`, () => {
        return supertest(app)
          .get('/api/favorites')
        //  .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testFavorites)
      });
    });
  
  });
/* 
  describe(`GET /api/noteful/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .get(`/api/noteful/folders/${folderId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: {  message: `Folder does not exist` } });
      });
    });

    context(`Given there are folders in the database`, () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert folders', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      context(`Given an XSS attack folder`, () => {
        const { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();

        beforeEach("insert malicious folder", () => {
          return db.into("favorites").insert([maliciousFavorite]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/noteful/folders/${maliciousFavorite.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.property).to.eql(expectedFavorite.property)
            });
        });
      });

      it(`responds with 200 and the specified folder`, () => {
        const folderId = 1;
        const expectedFavorite = camelCaseKeys(testFavorites[folderId - 1]);
        return supertest(app)
          .get(`/api/noteful/folders/${folderId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedFavorite)
      });
    });
  });

  describe('POST /api/noteful/folders', () => {
    it('creates a folder, responding with 201 and the new folder', function () {
      const newFolder = {
        property: 'Test new folder',
      };

      return supertest(app)
      .post('/api/noteful/folders')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send(newFolder)
      .expect(201)
      .expect(res => {
        expect(res.body.property).to.eql(newFolder.property);
        expect(res.body).to.have.property('id');
        expect(res.headers.location).to.eql(`/api/noteful/folders/${res.body.id}`);
      })
      .then(postRes => {
        return supertest(app)
          .get(`/api/noteful/folders/${postRes.body.id}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
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
          .post('/api/noteful/folders')
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(newFolder)
          .expect(400, {
            error: { message: `Required properties are missing: ${field}` }
          });
      });
    });

    context(`Given an XSS attack folder`, () => {
      let { maliciousFavorite, expectedFavorite } = makeMaliciousFavorite();
      maliciousFavorite = camelCaseKeys(maliciousFavorite);

      it("removes XSS attack content", () => {
        return supertest(app)
          .post(`/api/noteful/folders`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(maliciousFavorite)
          .expect(201)
          .expect((res) => {
            expect(res.body.property).to.eql(expectedFavorite.property);
          });
      });
    });
  });

  describe('DELETE /api/noteful/folders/:folder_id', () => {
    context('given no folders in the database', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/noteful/folders/${folderId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Folder does not exist` } })
      });
    })

    context('given the are folders in the database', () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert folders', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const serializedTestFavorites = testFavorites.map(camelCaseKeys);
        const expectedFavorites = serializedTestFavorites
          .filter(folder => folder.id !== idToRemove);
        return supertest(app)
          .delete(`/api/noteful/folders/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get('/api/noteful/folders')
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedFavorites)
          });
      });
    });
  });

  describe('PATCH /api/noteful/folders/:folder_id', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .patch(`/api/noteful/folders/${folderId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `Folder does not exist` } })
      });
    });

    context('Given there are folders in the database', () => {
      const testFavorites = makeFavoritesArray();

      beforeEach('insert folders', () => {
        return db
          .into('favorites')
          .insert(testFavorites)
      });

      it('responds with 204 and updates the folder', () => {
        const idToUpdate = 2;
        const updateFolder = {
          property: 'updated folder_name',
        };
        const serializedUpdateFolder = camelCaseKeys(testFavorites[idToUpdate - 1]);
        const expectedFavorite = {
          ...serializedUpdateFolder,
          ...updateFolder
        };

        return supertest(app)
          .patch(`/api/noteful/folders/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(updateFolder)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/noteful/folders/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedFavorite)
          });
      });

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/noteful/folders/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain: property`
            }
          });
      });

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2;
        const updateFolder = {
          property: 'updated folder folder_name'
        };
        const serializedUpdateFolder = camelCaseKeys(testFavorites[idToUpdate - 1]);
        const expectedFavorite = {
          ...serializedUpdateFolder,
          ...updateFolder
        };

        return supertest(app)
          .patch(`/api/noteful/folders/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send({...updateFolder, fieldToIgnore: 'should not be in GET response'})
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/noteful/folders/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedFavorite)
          });
      });
    });
  });
 */
 });