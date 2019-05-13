
exports.up = (knex, Promise) => {
  return knex.schema.table('orders', function(t) {
      t.string('orderedByPhone');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.table('orders', function(t) {
      t.dropColumn('orderedByPhone');
  });
}
