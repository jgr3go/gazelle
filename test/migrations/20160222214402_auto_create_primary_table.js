
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('primary_table', primary_table);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('primary_table');
};

function primary_table(table) {
  table.increments('c_increments')
    .primary()
    .unsigned()
    .notNullable();
  table.integer('c_unique')
    .unique()
    .nullable();
  table.integer('c_integer')
    .nullable();
  table.bigInteger('c_bigInteger')
    .nullable();
  table.text('c_text_text')
    .nullable();
  table.text('c_text_mediumtext', 'mediumtext')
    .nullable();
  table.text('c_text_longtext', 'longtext')
    .nullable();
  table.string('c_string')
    .nullable();
  table.string('c_string_512', 512)
    .nullable();
  table.float('c_float')
    .nullable();
  table.float('c_float_alt', 4, 1)
    .nullable();
  table.decimal('c_decimal')
    .nullable();
  table.boolean('c_boolean')
    .nullable();
  table.date('c_date')
    .nullable();
  table.dateTime('c_dateTime')
    .nullable();
  table.time('c_time')
    .nullable();
  table.timestamp('c_timestamp')
    .defaultTo('CURRENT_TIMESTAMP')
    .notNullable();
  table.binary('c_binary')
    .nullable();
  table.varbinary('c_binary_len', 4)
    .nullable();
  table.integer('c_index')
    .nullable();
  table.integer('c_default')
    .defaultTo(99)
    .nullable();
  table.integer('c_unsigned')
    .unsigned()
    .nullable();
  table.integer('c_nullable')
    .nullable();
  table.integer('c_comment')
    .nullable()
    .comment('!!!');
  table.integer('c_column_to_drop')
    .nullable();
}
