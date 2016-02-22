'use strict';

let config = require('../test/dbconfig');
let knex = require('knex')(config);

module.exports = knex;