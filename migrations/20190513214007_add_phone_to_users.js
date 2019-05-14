
exports.up = (knex, Promise) => {
  return knex.schema.table('users', function(t) {
      t.string('phone');
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.table('users', function(t) {
      t.dropColumn('phone');
  });
}
