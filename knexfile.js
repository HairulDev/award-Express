require("dotenv").config();
const { defaultTimeout } = require("#config/vars");

const {
  dbClient,
  dbHost,
  dbUser,
  dbPass,
  dbName,
  dbPort,
} = require("./config/vars");

module.exports = {
  development: {
    client: dbClient,
    debug: true,
    connection: {
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: dbName,
      options: {
        port: dbPort,
        encrypt: false,
        enableArithAbort: true,
      },
      requestTimeout: defaultTimeout,
    },
    acquireConnectionTimeout: defaultTimeout,
  },

  production: {
    client: dbClient,
    connection: {
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: dbName,
      options: {
        port: dbPort,
        encrypt: false,
        enableArithAbort: true,
      },
      requestTimeout: defaultTimeout,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    acquireConnectionTimeout: defaultTimeout,
  },
};
