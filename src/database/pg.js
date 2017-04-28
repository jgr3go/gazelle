'use strict';

let GenericDB = require('./generic').GenericDB;
let pgp = require('pg-promise');

class PostgresDB extends GenericDB {
  connect (connection) {
    this.db = pgp()(this.connection); 

    this.MAP = {
      'character varying': 'varchar',
      'character': 'char',
      'text': 'text',
      'bigint': 'bigint',
      'double precision': 'float',
      'real': 'real',
      'numeric': 'decimal',
      'boolean': 'boolean',
      'date': 'date',
      'json': 'json',
      'jsonb': 'jsonb'
    }
  }

  query (qs, vals) {
    return this.db.query(qs, vals);
  }

}

module.exports = PostgresDB;