'use strict';

let _ = require('lodash');
let nunjucks = require('nunjucks');
let fs = require('fs');
let knex = require('./database').knex;
let bluebird = require('bluebird');
let path = require('path');

module.exports = {
    generate: generate
};


function generate (comparison) {

    let nj = nunjucks.configure(path.resolve(__dirname, 'templates'), {
        autoescape: false,
        trimBlocks: true
    });
    let pending = [];

    if (comparison.createTables) {
        _.each(comparison.createTables, (tableDef, tableName) => {
            let res = generateCreateTable(nj, tableName, tableDef);
            let create = knex.migrate.make(`auto_create_${tableName}`)
                .then(file => {
                    fs.writeFileSync(file, res);
                });
            pending.push(create);
        });
    }

    if (comparison.dropTables) {
        _.each(comparison.dropTables, (tableDef, tableName) => {
            let res = generateDropTable(nj, tableName, tableDef);
            let drop = knex.migrate.make(`auto_drop_${tableName}`)
                .then(file => {
                    fs.writeFileSync(file, res);
                });
            pending.push(drop);
        });
    }

    if (comparison.alterTables) {
        _.each(comparison.alterTables, (tableDef, tableName) => {
            let res = generateAlterTable(nj, tableName, tableDef);
            let alter = knex.migrate.make(`auto_alter_${tableName}`)
                .then(file => {
                    fs.writeFileSync(file, res);
                });
            pending.push(alter);
        })
    }

    return bluebird.all(pending);
}

function generateCreateTable (nj, tableName, tableDef) {
    let args = generateTableMigrationArgs(tableName, tableDef);
    args.columns = objectToList(args.columns);
    return nj.render('createTable.js', args);
}

function generateDropTable (nj, tableName, tableDef) {
    let args = generateTableMigrationArgs(tableName, tableDef);
    args.columns = objectToList(args.columns);
    return nj.render('dropTable.js', args);
}

function generateAlterTable (nj, tableName, tableDef) {
    let args = generateTableMigrationArgs(tableName, tableDef);
    args.addColumns = objectToList(args.addColumns);
    args.removeColumns = objectToList(args.removeColumns);
    return nj.render('alterTable.js', args);
}

function generateTableMigrationArgs (tableName, tableDef, type) {
    let args = _.cloneDeep(tableDef);
    args.tableName = tableName;
    args.columnToString = columnToString;
    return args;
}

function objectToList (object) {
    let list = [];
    _.each(object, (val, key) => {
        val.name = key;
        list.push(val)
    });
    return list;
}   

function columnToString (col) {
    let cs = ``;
    if (_.isArray(col.type)) {
        let extra = col.type.slice(1);
        _.each(extra, (ext, idx) => {
            if (!_.isNumber(ext)) {
                extra[idx] = `'${ext}'`;
            }
        })
        cs += `.${col.type[0]}('${col.name}', ${extra.join(', ')})`;
    } else {
        cs += `.${col.type}('${col.name}')`;
    }
    if (col.index) {
        cs += `\n    .index()`;
    }
    if (col.primary) {
        cs += `\n    .primary()`;
    }
    if (col.unique) {
        cs += `\n    .unique()`;
    }
    if (col.references) {
        cs += `\n    .references('${col.references}')`;
        cs += `\n    .inTable('${col.inTable}')`;
    }
    if (col.onDelete) {
        cs += `\n    .onDelete('${col.onDelete}')`;
    }
    if (col.onUpdate) {
        cs += `\n    .onUpdate('${col.onUpdate}')`;
    }
    if (col.defaultTo) {
        let dt = col.defaultTo;
        if (!parseInt(dt, 10) && !parseFloat(dt)) {
            dt = `'${dt}'`;
        }
        cs += `\n    .defaultTo(${dt})`;
    }
    if (col.unsigned) {
        cs += `\n    .unsigned()`;
    }
    if (col.nullable) {
        cs += `\n    .nullable()`;
    } else {
        cs += `\n    .notNullable()`;
    }
    if (col.comment) {
        cs += `\n    .comment('${col.comment}')`;
    }

    return cs;
}