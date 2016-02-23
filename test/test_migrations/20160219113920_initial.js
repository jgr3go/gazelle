
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('primary_table', primary_table)
    .createTable('foreign_table', foreign_table)
    .createTable('schema_table', schema_table);
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('schema_table', schema_table)
    .dropTable('foreign_table', foreign_table)
    .dropTable('primary_table', primary_table);
};


function primary_table(table) {
    table.increments("c_increments").primary();
    table.integer("c_integer");
    table.bigInteger("c_bigInteger");
    table.text('c_text_text');
    table.text('c_text_mediumtext', 'mediumtext');
    table.text('c_text_longtext', 'longtext');
    table.string('c_string');
    table.string('c_string_512', 512);
    table.float('c_float');
    table.float('c_float_alt', 4, 1);
    table.decimal('c_decimal');
    table.boolean('c_boolean');
    table.date('c_date');
    table.dateTime('c_dateTime');
    table.time('c_time');
    table.timestamp('c_timestamp');
    // table.timestamps //TODO
    table.binary('c_binary');
    table.binary('c_binary_len', 4);
    // table.enum  //TODO
    // table.json  //TODO
    // table.jsonb //TODO
    // table.uuid  //TODO
    
    table.integer('c_index')
        .index();
    table.integer('c_unique')
        .unique()
        .index();
    table.integer('c_default')
        .defaultTo(99);
    table.integer('c_unsigned')
        .unsigned();
    table.integer('c_nullable')
        .nullable();
    table.integer('c_comment')
        .comment("!!!");
    table.integer('c_column_to_drop');
}

function foreign_table(table) {
    table.integer('p_ref')
        .unsigned()
        .references('c_increments')
        .inTable('primary_table')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    table.integer('index_1');
    table.integer('index_2');
    table.index(['index_1', 'index_2']);

    table.integer('unique_1');
    table.integer('unique_2');
    table.unique(['unique_1', 'unique_2']);

    table.integer('unique_index')
        .unique()
        .index();
}

function schema_table (table) {
    table.integer('not_in_defs');
}