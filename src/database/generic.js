'use strict';

let BB = require('bluebird');
let fs = require('fs');
let _ = require('lodash');

class GenericDB {

  constructor(connection) {
    this.connection = connection;
    this.database = connection.database;
    this.tables = {};
    this.MAP = {};
  }

  connect() {
    return Promise.reject('Virtual Function');
  }

  query(qs) {
    return Promise.reject('Virtual Function');
  }

  load() {
    return BB.props({
      tables: this.loadTables(),
      columns: this.loadTablesAndColumns(),
      constraints: this.loadConstraints()
    })
    .then(res => {
      this.parseTables(res.tables);
      this.parseColumns(res.columns);
      this.parseConstraints(res.constraints);

      fs.writeFileSync('results.json', JSON.stringify(this, null, 2));
    });
  }

  loadTables() {
    let query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_catalog = '${this.database}' 
      AND table_schema = 'public'
    `;
    return this.query(query);
  }

  parseTables (tables) {
    for (let table of tables) {
      if (!this.tables[table.table_name]) {
        this.tables[table.table_name] = {
          name: table.table_name,
          columns: {},
          constraints: {
            unique: []
          }
        };
      }
    }
    return this.tables;
  }

  loadTablesAndColumns () {
    let query = `
      SELECT  table_name,
              column_name, 
              column_default,
              ordinal_position,
              is_nullable,
              data_type,
              character_maximum_length,
              numeric_precision,
              numeric_precision_radix,
              numeric_scale,
              datetime_precision,
              interval_type
      FROM information_schema.columns
      WHERE table_catalog = '${this.database}' 
      AND table_schema = 'public'
    `;
    return this.query(query);
  }

  parseColumns (cols) {
    for (let col of cols) {
      let table = this.tables[col.table_name];

      if (!table.columns[col.column_name]) {
        table.columns[col.column_name] = this.parseColumn(col);
      }
    }
    return this.columns;
  }

  parseColumn (col) {
    return {
      name: col.column_name,
      table_name: col.table_name,
      position: col.ordinal_position,
      default: col.column_default,
      generated: false,
      nullable: col.is_nullable === 'YES',
      data_type: this.MAP[col.data_type] || col.data_type,
      charmax: col.character_maximum_length,
      num_precision: col.numeric_precision,
      num_radix: col.numeric_precision_radix,
      num_scale: col.numeric_scale,
      datetime_precision: col.datetime_precision,

      primary: false,
      unique: false,
      fk: false,
      fk_table: null,
      fk_col: null,

      raw: col
    };
  }

  loadConstraints () {
    // let tables = ['constraint_column_usage', 'key_column_usage'];

    // return BB.all(tables.map(table => {
      // let query = `
      //     SELECT kc.constraint_name, kc.column_name, kc.table_name, c.constraint_type
      //     FROM information_schema.${table} AS kc
      //     JOIN information_schema.table_constraints AS c ON
      //       kc.table_schema = c.table_schema AND
      //       kc.table_name = c.table_name AND
      //       kc.constraint_name = c.constraint_name
      //     WHERE kc.table_schema = 'public'
      // `;
      let query = `
        SELECT
            tc.constraint_name, 
            tc.constraint_type,
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
      `;
    return this.query(query);
    // }))
      // .then(constraints => {
      //   return constraints[0].concat(constraints[1]);
      // });
  }
  parseConstraints (constraints) {
    this.constraints = constraints; 

    let unique = {};

    for (let con of constraints) {
      let column = this.tables[con.table_name].columns[con.column_name];
      switch (con.constraint_type.toLowerCase()) {
        case 'primary key': {
          column.primary = true;
          break;
        }
        case 'unique': {
          if (!unique[con.constraint_name]) {
            unique[con.constraint_name] = [];
          }
          let key = `${con.table_name}::${con.column_name}`;
          if (!unique[con.constraint_name].includes(key)) {
            unique[con.constraint_name].push(key);
          }
          break;
        }
        case 'foreign key': {
          column.fk = true;
          column.fk_table = con.foreign_table_name;
          column.fk_col = con.foreign_column_name;
          break;
        }
      }
    }

    _.each(unique, (arr, con) => {
      if (arr.length === 1) {
        let key = arr[0].split('::');
        this.tables[key[0]].columns[key[1]].unique = true;
      } else {
        let cols = [], table;
        _.each(arr, key => {
          key = key.split('::');
          table = key[0];
          cols.push(key[1]);
        });
        this.tables[table].constraints.unique.push(cols);
      }
    });


    return constraints;
  }
}

exports.GenericDB = GenericDB;