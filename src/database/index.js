'use strict';

let errors = require('../errors');

let DB_SUPPORT = [
  'pg', 'postgres', 'postgresql',
  'mysql'
];

let DB;

exports.initialize = function (commander, env) {
  let cfg = require(env.configPath);
  if (!DB_SUPPORT.includes(cfg.client)) {
    throw new errors.Unsupported(`${cfg.client} is not a supported database engine`);
  }

  let Database;
  if (cfg.client === 'pg' || cfg.client === 'postgres' || cfg.client === 'postgresql') {
    Database = require('./pg');
  }
  DB = new Database(cfg.connection);

  DB.connect();
};

exports.get = function() {
  return DB;
};