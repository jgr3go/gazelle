'use strict';

let chalk = require('chalk');

class Database {
    constructor () {
        this.environment = undefined;
        this.config = undefined;
        this.knex = undefined;
    }

    initialize (commander, env) {
        let environment = commander.env || process.env.NODE_ENV;
        let defaultEnv = 'development';

        let config = require(env.configPath);

        if (!environment && typeof config[defaultEnv] === 'object') {
            environment = defaultEnv;
        }

        if (environment) {
            console.log('Using environment:', chalk.magenta(environment));
            config = config[environment] || config;
        }

        if (!config) {
            console.log(chalk.red('Warning: unable to read knexfile config'));
            process.exit(1);
        }
        
        let knex = require('knex')(config);

        this.environment = environment;
        this.config = config;
        this.knex = knex;
    }
};

module.exports = new Database();

