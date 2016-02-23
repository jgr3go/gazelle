'use strict';

let _ = require('lodash');

module.exports = {
    compare: compare
};

function compare (schema, defs) {
    let result = {};

    let tableDiff = diff(schema, defs);
    result.dropTables = tableDiff.leftOnly;
    result.createTables = tableDiff.rightOnly;

    result.alterTables = {};
    // loop through tables that exist but are different
    _.each(tableDiff.sharedKeys, (v, tableName) => {
        // columns need to be added or removed
        let schemaTable = schema[tableName], defsTable = defs[tableName];
        result.alterTables[tableName] = {};
        let at = result.alterTables[tableName];
        if (!equalKeys(schemaTable.columns, defsTable.columns)){
            let columnDiff = diff(schemaTable.columns, defsTable.columns);
            at.removeColumns = columnDiff.leftOnly;
            at.addColumns = columnDiff.rightOnly;
        }
        if (!equalKeys(schemaTable.indexes, defsTable.indexes)) {
            let indexDiff = diff(schemaTable.indexes, defsTable.indexes);
            at.removeIndexes = indexDiff.leftOnly;
            at.addIndexes = indexDiff.rightOnly;
        }
        if (!equalKeys(schemaTable.uniques, defsTable.uniques)) {
            let uniqueDiff = diff(schemaTable.uniques, defsTable.uniques);
            at.removeUniques = uniqueDiff.leftOnly;
            at.addUniques = uniqueDiff.rightOnly;
        }
    });

    return result;
}

function diff (left, right) {
    let results = {
        leftOnly: {},
        sharedKeys: {},
        rightOnly: {}
    };

    _.each(left, (prop, key) => {
        if (right.hasOwnProperty(key)) {
            results.sharedKeys[key] = true;
        } else {
            results.leftOnly[key] = prop;
        }
    });
    _.each(right, (prop, key) => {
        if (!left.hasOwnProperty(key)) {
            results.rightOnly[key] = prop;
        }
    });

    return results;
}

function equalKeys (left, right) {
    if (_.isNil(left) && _.isNil(right)) {
        return true;
    }
    if (_.isNil(left) || _.isNil(right)) {
        return false;
    }

    let equal = true;
    _.each(left, (prop, key) => {
        if (!right.hasOwnProperty(key)) {
            equal = false;
        }
    });
    _.each(right, (prop, key) => {
        if (!left.hasOwnProperty(key)) {
            equal = false;
        }
    });
    return equal;
}