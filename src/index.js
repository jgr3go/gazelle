'use strict';

let config = require('../test/dbconfig');
let knex = require('knex')(config);
let schema = require('./schema')(knex);
let bluebird = require('bluebird');
let comparer = require('./comparer');

module.exports = {
  create,
  detect
};

function detect (env) {
  return schema.getSchema();
}

function create (env) {
  let models;
  return getConfig(env)
    .then(cfg => {
      models = cfg;
      return detect(env);
    })
    .then(schema => {
      return compare(schema, models);
    });
}

function getConfig (env) {
  return bluebird.resolve()
    .then(() => {
      if (!env.configPath) {
        throw new Error("No model file found (flyway.js[on] or --config [path])");
      }
      return require(env.configPath);
    });
}

function compare (schema, defs) {
  let results = comparer.compare(schema, defs);
  console.log(results);
  return results;
}