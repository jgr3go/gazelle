'use strict';

let _ = require('lodash');

module.exports = {
    compare: compare
};

function compare (schema, defs) {
    let result = {};
    result.create = needsCreate(schema, defs);
    result.drop = needsDrop(schema, defs);
    result.alter = {};

    return result;
}

function needsCreate(schema, defs) {
    let create = {};
    _.each(defs, (tableDef, tableName) => {
        if (!schema[tableName]) {
            create[tableName] = tableDef;
        }
    });
    return create;
}

function needsDrop(schema, defs) {
    let drop = {};
    _.each(schema, (tableDef, tableName) => {
        if (!defs[tableName]) {
            drop[tableName] = true;
        }
    });
    return drop;
}

function needsAddColumn(schemaTable, defTable) {
    let add = {};
    _.each(defTable.columns, (columnDef, columnName) => {
        if (!schemaTable[columnName]) {
            add[columnName] = columnDef;
        }
    });
    return add;
}

function needsRemoveColumn(schemaTable, defTable) {
    let remove = {};
    _.each(schemaTable.columns, (columnDef, columnName) => {
        if (!defTable[columnName]) {
            remove[columnName] = true;
        }
    });
}