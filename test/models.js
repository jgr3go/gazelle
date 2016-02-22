'use strict';

module.exports = {
  primary_table: {
    columns: {
      c_increments: {
        type: 'increments',
        primary: true
      },
      c_integer: {
        type: 'integer'
      },
      c_bigInteger: {
        type: 'bigInteger'
      },
      c_text_text: {
        type: 'text'
      },
      c_text_mediumtext: {
        type: ['text', 'mediumtext']
      },
      c_text_longtext: {
        type: ['text', 'longtext']
      },
      c_string: {
        type: 'string'
      },
      c_string_512: {
        type: ['string', 512]
      },
      c_float: {
        type: 'float'
      },
      c_float_alt: {
        type: ['float', 4, 1]
      },
      c_decimal: {
        type: 'decimal'
      },
      c_boolean: {
        type: 'boolean'
      },
      c_date: {
        type: 'date'
      },
      c_dateTime: {
        type: 'dateTime'
      },
      c_time: {
        type: 'time'
      },
      c_timestamp: {
        type: 'timestamp'
      },
      c_binary: {
        type: 'binary'
      },
      c_binary_len: {
        type: ['binary', 4]
      },
      c_index: {
        type: 'integer',
        index: true
      },
      c_unique: {
        type: 'integer',
        unique: true,
        index: true
      },
      c_default: {
        type: 'integer',
        defaultTo: 99
      },
      c_unsigned: {
        type: 'integer',
        unsigned: true
      },
      c_nullable: {
        type: 'integer',
        nullable: true
      },
      c_comment: {
        type: 'integer',
        comment: '!!!'
      },
      c_column_to_add: {
        type: "integer"
      }
    }
  },

  foreign_table: {
    columns: {
      p_ref: {
        type: 'integer',
        references: 'primary_table.c_increments',
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      index_1: {
        type: 'integer'
      },
      index_2: {
        type: 'integer'
      }
    }
  },

  model_table: {
    columns: {
      not_in_database: {
        type: 'integer'
      }
    }
  }
};