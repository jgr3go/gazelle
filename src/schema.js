'use strict';

let _ = require('lodash');
let Bluebird = require('bluebird');

class Schema {
  constructor (knex) {
    this.knex = knex;
    this.schema = knex.client.config.connection.database;
  }

  getSchema () {
    /* Final object should look like:
     {
        table1: {
           columns: {
              column1: { ... }
           },
           indexes: {
  
           },
           unique: {
  
           }
        },
        table2 : { ... }
     }
    */
    let tableInfo = {};

    // get tables
    return this.tables()
      .then(tables => {
        tableInfo = tables;

        // get the columns of each table
        let pending = [];
        _.each(tableInfo, (tableDef, tableName) => {
          let p = this.columns(tableName, tableDef);
          pending.push(p);
        });

        return Bluebird.all(pending);
      })
      .then(columnLists => {
        // get the indexes/uniques
        let pending = [];
        _.each(tableInfo, (tableDef, tableName) => {
          let p = this.indexes(tableName, tableDef);
          pending.push(p);
        });

        return Bluebird.all(pending);
      })
      .then(indexLists => {
        return tableInfo;
      });
  }

  /**
   * @returns Object - { table1: {}, table2: {} }
   */
  tables () {
    return this.knex.raw("SHOW TABLES")
      .then(tables => {
        return tables[0].map(table => {
          return table[tables[1][0].name];
        })
        .filter(table => {
          return (table !== 'knex_migrations' && table !== 'knex_migrations_lock');
        });
      })
      .then(tableList => {
        let allTables = {};
        _.each(tableList, tableName => {
          allTables[tableName] = {
            columns: {},
            indexes: {},
            uniques: {}
          };
        });
        return allTables;
      });
  }

  columns (tableName, tableDef) {
    // Get the columns and foreign keys in one query
    // which is why we don't just 'SHOW COLUMNS' or 'DESCRIBE TABLE'
    let query = 
      `SELECT col.*,
              kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME,
              rc.DELETE_RULE, rc.UPDATE_RULE, rc.UNIQUE_CONSTRAINT_NAME, rc.MATCH_OPTION
       FROM information_schema.COLUMNS col
       LEFT OUTER JOIN information_schema.KEY_COLUMN_USAGE kcu
         ON kcu.TABLE_SCHEMA = col.table_schema
         AND kcu.TABLE_NAME = col.table_name
         AND kcu.COLUMN_NAME = col.COLUMN_NAME
       LEFT OUTER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
         ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
         AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
       WHERE col.table_schema = '${this.schema}' and col.table_name = '${tableName}'`;
    
    // get columns
    return this.knex.raw(query)
      .then(columns => {
        return columns[0];
      })
      // process columns
      .then(columns => {
        return columns.map(column => {
          return new Column(column);
        });
      })
      // convert to object
      .then(columns => {
        // convert to object
        let obj = {};
        _.each(columns, column => {
          obj[column.name] = column;
        });
        return obj;
      })
      // attach to table
      .then(columns => {
        tableDef.columns = columns;
      });
  }

  indexes (tableName, tableDef) {
    let query = `SHOW INDEXES FROM ${tableName}`;

    return this.knex.raw(query)
      // process raw result
      .then(indexes => {
        return indexes[0];
      })
      // process indexes
      .then(indexList => {
        let indexes = {};
        _.each(indexList, index => {
          if (!indexes[index.Key_name]) {
            indexes[index.Key_name] = {
              name: index.Key_name,
              unique: !index.Non_unique,
              columns: [index.Column_name]
            };
          } else {
            indexes[index.Key_name].columns.push(index.Column_name);
          }
        });

        _.each(indexes, (indexDef, indexName) => {
          // specific to a column
          if (indexDef.columns.length === 1) {
            let colName = indexDef.columns[0];
            if (indexDef.unique) {
              tableDef.columns[colName].unique = indexName;
            } else {
              tableDef.columns[colName].index = indexName;
            }
          }
          // table-wide
          else 
          {
            if (indexDef.unique) {
              tableDef.uniques[indexName] = {
                name: indexName,
                columns: indexDef.columns
              };
            } else {
              tableDef.indexes[indexName] = {
                name: indexName,
                columns: indexDef.columns
              };
            }
          }
        });
      });
  }

}

class Column {
  constructor (raw) {
    this._raw = raw;
    this.name = '';
    this.type = '';
    this.index = null;
    this.primary = null;
    this.unique = null;
    this.references = null;
    this.inTable = null;
    this.onDelete = null;
    this.onUpdate = null;
    this.defaultTo = null;
    this.unsigned = null;
    this.nullable = null;
    this.comment = null;

    this.process();
  }

  process () {
    let r = this._raw;
    this.name = r.COLUMN_NAME;
    // this.index =    // TODO
    this.primary = r.COLUMN_KEY === 'PRI';
    this.unique = r.COLUMN_KEY === 'UNI';
    if (r.REFERENCED_COLUMN_NAME) {
      this.references = r.REFERENCED_COLUMN_NAME;
      this.inTable = r.REFERENCED_TABLE_NAME;
    }
    if (r.DELETE_RULE) {
      this.onDelete = r.DELETE_RULE;
    }
    if (r.UPDATE_RULE) {
      this.onUpdate = r.UPDATE_RULE;
    }
    this.defaultTo = r.COLUMN_DEFAULT;
    this.unsigned = !!r.COLUMN_TYPE.match(/unsigned/);
    this.nullable = r.IS_NULLABLE === 'YES';
    this.comment = r.COLUMN_COMMENT;

    this.coerceType();
  }

  coerceType () {
    function numeric (type, col) {
      if (col.NUMERIC_PRECISION === 8 && col.NUMERIC_SCALE === 2) {
        return type;
      } else {
        type = [type, undefined, undefined];
        if (col.NUMERIC_PRECISION !== 8) {
          type[1] = col.NUMERIC_PRECISION;
        } 
        if (col.NUMERIC_SCALE !== 2) {
          type[2] = col.NUMERIC_SCALE;
        }
        return type;
      }
    }

    let MAP = {
      'int': 'integer',
      'bigint': 'bigInteger',
      'text': 'text',
      'mediumtext': ['text', 'mediumtext'],
      'longtext': ['text', 'longtext'],
      'varchar': function (col) {
        if (col.CHARACTER_MAXIMUM_LENGTH === 255) {
          return 'string'
        } else {
          return ['string', col.CHARACTER_MAXIMUM_LENGTH];
        }
      },
      'float': function (col) {
        return numeric('float', col);
      },
      'decimal': function (col) {
        return numeric('decimal', col);
      },
      'tinyint': function (col) {
        if (col.COLUMN_TYPE === 'tinyint(1)') {
          return 'boolean';
        } else {
          return numeric('tinyint', col);
        }
      },
      'date': 'date',
      'datetime': 'dateTime',
      'time': 'time',
      'timestamp': 'timestamp',
      'blob': 'binary',
      'varbinary': function (col) {
        return ['varbinary', col.CHARACTER_MAXIMUM_LENGTH];
      }
    }

    let r = this._raw;
    let mapped = MAP[r.DATA_TYPE];

    if (r.EXTRA.match(/auto_increment/)) {
      this.type = 'increments';
    } else if (mapped) {
      if (_.isFunction(mapped)) {
        this.type = mapped(r);
      }
      else {
        this.type = mapped;
      }
    }
  }
}

module.exports = function (knex) {
  return new Schema(knex);
}