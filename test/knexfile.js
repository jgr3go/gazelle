'use strict';

let path = require('path'); 

module.exports = {

  development: {
    client: "mysql",
    connection: {
        host: "localhost",
        user: "flywayuser",
        database: "flyway",
        port: 3306
    }
  },

  test: {
    client: "mysql",
    connection: {
        host: "localhost",
        user: "flywayuser",
        database: "flyway",
        port: 3306
    },
    migrations: {
        directory: "test_migrations"
    }
  }

};
