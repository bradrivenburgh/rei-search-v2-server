const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "test-user-1",
      first_name: "Test 1",
      last_name: "User 1",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      user_name: "test-user-2",
      first_name: "Test 2",
      last_name: "User 2",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 3,
      user_name: "test-user-3",
      first_name: "Test 3",
      last_name: "User 3",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 4,
      user_name: "test-user-4",
      first_name: "Test 4",
      last_name: "User 4",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 5,
      user_name: "test-user-5",
      first_name: "Test 5",
      last_name: "User 5",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  return { testUsers };
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        favorites,
        reisearch_users
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE reisearch_users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('reisearch_users_id_seq', 0)`),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("reisearch_users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('reisearch_users_id_seq', ?)`, [
        users[users.length - 1].id,
      ])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeFixtures,
  cleanTables,
  makeAuthHeader,
  seedUsers,
};
