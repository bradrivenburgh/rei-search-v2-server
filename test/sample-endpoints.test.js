/**
 * Sample endpoints implementation test file for normalized DB 
 * using postgreSQL. Shows data seeding and cleanup; shows type
 * of tests to create.
 */

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeArticlesArray, makeMaliciousArticle } = require('./articles.fixtures');
const { makeUsersArray } = require('./users.fixtures');

describe('Articles Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set('db', db);
  });

  before('clean the table', () => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'));
  
  after('disconnect from db', () => db.destroy());

  afterEach('cleanup', () => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'));

  describe(`GET /api/articles`, () => {
    context(`Given no articles`, () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, []);
      });
    });

    context(`Given there are articles in the database`, () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles);
          })
      });

      context(`Given an XSS attack article`, () => {
        const { maliciousArticle, expectedArticle } = makeMaliciousArticle();

        beforeEach("insert malicious article", () => {
          return db.into("blogful_articles").insert([maliciousArticle]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/articles`)
            .expect(200)
            .expect((res) => {
              const insertedArticle = res.body[res.body.length - 1];
              expect(insertedArticle.title).to.eql(expectedArticle.title);
              expect(insertedArticle.content).to.eql(expectedArticle.content);
            });
        });
      });
      
      it(`responds with 200 and all of the articles`, () => {
        return supertest(app)
          .get('/api/articles')
          .expect(200, testArticles)
      });
    });
  });

  describe(`GET /api/articles/:article_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456;
        return supertest(app)
          .get(`/api/articles/${articleId}`)
          .expect(404, { error: {  message: `Article doesn't exist` } });
      });
    });

    context(`Given there are articles in the database`, () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles);
          })
      });

      context(`Given an XSS attack article`, () => {
        const { maliciousArticle, expectedArticle } = makeMaliciousArticle();

        beforeEach("insert malicious article", () => {
          return db.into("blogful_articles").insert([maliciousArticle]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/articles/${maliciousArticle.id}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.title).to.eql(expectedArticle.title)
              expect(res.body.content).to.eql(expectedArticle.content)
            });
        });
      });

      it(`responds with 200 and the specified article`, () => {
        const article_id = 1;
        const expectedArticle = testArticles[article_id - 1]
        return supertest(app)
          .get(`/api/articles/${article_id}`)
          .expect(200, expectedArticle)
      });
    });
  });

  describe('POST /api/articles', () => {
    it('creates an article, responding with 201 and the new article', function () {
      this.retries(3);

      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      };

      return supertest(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(newArticle.title);
        expect(res.body.style).to.eql(newArticle.style);
        expect(res.body.content).to.eql(newArticle.content);
        expect(res.body).to.have.property('id');
        expect(res.headers.location).to.eql(`/api/articles/${res.body.id}`);
        
        const expectedDate = new Date().toLocaleString();
        const actualDate = new Date(res.body.date_published).toLocaleString();
        expect(actualDate).to.eql(expectedDate);
      })
      .then(postRes => {
        return supertest(app)
          .get(`/api/articles/${postRes.body.id}`)
          .expect(postRes.body)
      });
    });

    const requiredFields = ['title', 'style', 'content'];
    requiredFields.forEach(field => {
      const newArticle = {
        title: 'Test new article',
        style: 'Listicle',
        content: 'Test new article content...'
      };
  
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newArticle[field];

        return supertest(app)
          .post('/api/articles')
          .send(newArticle)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    context(`Given an XSS attack article`, () => {
      const { maliciousArticle, expectedArticle } = makeMaliciousArticle();
  
      it("removes XSS attack content", () => {
        return supertest(app)
          .post(`/api/articles`)
          .send(maliciousArticle)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).to.eql(expectedArticle.title);
            expect(res.body.content).to.eql(expectedArticle.content);
          });
      });
    });
  });

  describe('DELETE /api/articles/:article_id', () => {
    context('given no articles in the database', () => {
      it('responds with 404', () => {
        const articleId = 123456;
        return supertest(app)
          .delete(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      });
    })

    context('given the are articles in the database', () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles);
          })
      });

      it('responds with 204 and removes the article', () => {
        const idToRemove = 2;
        const expectedArticles = testArticles
          .filter(article => article.id !== idToRemove);
        return supertest(app)
          .delete(`/api/articles/${idToRemove}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get('/api/articles')
              .expect(expectedArticles)
          });
      });
    });
  });

  describe('PATCH /api/articles/:article_id', () => {
    context('Given no articles', () => {
      it('responds with 404', () => {
        const articleId = 123456;
        return supertest(app)
          .patch(`/api/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      });
    });

    context('Given there are articles in the database', () => {
      const testUsers = makeUsersArray();
      const testArticles = makeArticlesArray();

      beforeEach('insert articles', () => {
        return db
          .into('blogful_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('blogful_articles')
              .insert(testArticles);
          })
      });

      it('responds with 204 and updates the article', () => {
        const idToUpdate = 2;
        const updateArticle = {
          title: 'updated article title',
          style: 'Interview',
          content: 'updated article content',
        };
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }

        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send(updateArticle)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          });
      });

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'style' or 'content'`
            }
          });
      });

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2;
        const updateArticle = {
          title: 'updated article title',
          content: 'updated article content'
        };
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }

        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({...updateArticle, fieldToIgnore: 'should not be in GET response'})
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          });
      });
    });
  });

});