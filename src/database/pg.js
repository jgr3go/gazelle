'use strict';

let GenericDB = require('./generic');
let pgp = require('pg-promise');

class PostgresDB extends GenericDB {
  connect () {
    this.db = pgp()(this.connection); 
  }
}

module.exports = PostgresDB;