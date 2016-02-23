'use strict';

let knex = require('./database').knex;
let schema = require('./schema')(knex);
let bluebird = require('bluebird');
let comparer = require('./comparer');
let generator = require('./generator');

module.exports = {
  create,
  detect,
  clone
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
    })
    .then(comparison => {
      return generate(comparison);
    });
}

function clone (env) {
  let models;
  return detect(env)
    .then(schema => {
      return {
        createTables: schema
      };
    })
    .then(comparison => {
      return generate(comparison);
    });
}

function getConfig (env) {
  return bluebird.resolve()
    .then(() => {
      if (!env.configPath) {
        throw new Error("No model file found (models.js[on] or --config [path])");
      }
      return require(env.configPath);
    });
}

function compare (schema, defs) {
  let results = comparer.compare(schema, defs);
  return results;
}

function generate (comparison) {
  return generator.generate(comparison);
}