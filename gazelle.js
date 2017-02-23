'use strict';

module.exports = {
  migrator: 'knex',
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'gazelle',
    user: 'gazelle',
    password: 'gazelle'
  }
};