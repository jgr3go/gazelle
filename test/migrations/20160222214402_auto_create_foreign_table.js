
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('foreign_table', foreign_table);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('foreign_table');
};

function foreign_table(table) {
  table.integer('p_ref')
    .references('c_increments')
    .inTable('primary_table')
    .onDelete('CASCADE')
    .onUpdate('CASCADE')
    .unsigned()
    .notNullable();
  table.integer('index_1')
    .nullable();
  table.integer('index_2')
    .nullable();
}
