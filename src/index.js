'use strict';

let BB = require('bluebird');

module.exports = {
  create,
  detect,
  clone
};

function detect (env) {
  
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
  return BB.resolve()
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