'use strict'; 

let Liftoff = require('liftoff');
let commander = require('commander');
let chalk = require('chalk');
let pkg = require('../../package.json');
let yargs = require('yargs').argv;
let db = require('../database');

function exit(text) {
  if (text instanceof Error) {
    console.error(chalk.red(text.stack));
  } else {
    console.error(chalk.red(text));
  }
  process.exit(1);
}

function success (text) {
  console.log(text);
  process.exit(0);
}

function init (env) {

  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    console.log("Working directory changed to", chalk.magenta(env.cwd));
  }
  if (!env.configPath) {
    exit("Could not find config file (default: gazelle.js[on])");
  }

  db.initialize(commander, env);
}


function start (env) {
  let lib = require('../');
  let actionRunning;

  commander
    .version(
      chalk.gray('gazelle CLI version: ', chalk.green(pkg.version))
    )
    .option("--cwd [path]", "Specify the working directory")
    .option("--env [env]", "Specify an environment to determine database connection in your knexfile")
    .option("--cfg [cfg]", "Specify a config file (default: gazelle.js[on])")
    .option("--test", "Don't output any migrations, but print to the console what would be created");

  commander
    .command('create')
    .description('    Detects and creates migrations based on database.')
    .action(() => {
      init(env);
      actionRunning = lib.create(env, db.get())
        .then(() => {
          return success(chalk.green("Done"));
        })
        .catch(exit);
    });

  // commander
  //   .command('clone')
  //   .description('    Creates migrations that would clone your current database from scratch.')
  //   .action(() => {
  //     actionRunning = lib.clone(env)
  //       .then(() => {
  //         return success(chalk.green("Done"));
  //       })
  //       .catch(exit);
  //   });

  // commander
  //   .command('test')
  //   .description('    Test')
  //   .action(function test() {
  //   });

    
  commander.parse(process.argv);

  // runs if none of the other actions have started
  Promise.resolve(actionRunning).then(() => {
    commander.help();
  });

}

let cli = new Liftoff({
  name: "gazelle",
  configName: "gazelle",
  extensions: {
    '.js': null,
    '.json': null
  }
});

cli.launch({
  cwd: yargs.cwd,
  configPath: yargs.config,
  completion: yargs.completion,
}, start);