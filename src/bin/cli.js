'use strict'; 

let Liftoff = require('liftoff');
let commander = require('commander');
let chalk = require('chalk');
let pkg = require('../../package.json');
let lib = require('../');
let yargs = require('yargs').argv;


function exit(text) {
  if (text instanceof Error) {
    chalk.red(console.error(text.stack));
  } else {
    chalk.red(console.error(text));
  }
  process.exit(1);
}

function success (text) {
  console.log(text);
  process.exit(0);
}


function start (env) {
  let actionRunning;

  commander
    .version(
      chalk.blue('flyway CLI version: ', chalk.green(pkg.version))
    )
    .option("--cwd [path]", "Specify the working directory")
    .option("--models [path]", "Specify the flyway models file (default: flyway.js[on])");

  commander
    .command('create')
    .description('    Detects and creates knex migrations based on database.')
    .action(() => {
      actionRunning = lib.create(env)
        .then(() => {
          return success(chalk.green("Done"));
        })
        .catch(exit);
    });

  commander
    .command('clone')
    .description('    Creates migrations that would clone your current database from scratch.')
    .action(() => {
      actionRunning = lib.clone(env)
        .then(() => {
          return success(chalk.green("Done"));
        })
        .catch(exit);
    });
    
  commander.parse(process.argv);

  // runs if none of the other actions have started
  Promise.resolve(actionRunning).then(() => {
    commander.help();
  });

}

let cli = new Liftoff({
  name: "flyway",
  processTitle: "flyway",
  configName: "flyway",
  extensions: {
    '.js': null,
    '.json': null
  }
});

cli.launch({
  cwd: yargs.cwd,
  configPath: yargs.models,
}, start);