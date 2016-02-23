
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('schema_table', schema_table);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('schema_table');
};

function schema_table(table) {
  table.integer('not_in_defs')
    .nullable();
}
