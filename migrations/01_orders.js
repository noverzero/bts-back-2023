
exports.up = function(knex, Promise) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id')
    // table.integer('reservationId')
    table.string('orderedByFirstName', '40').notNullable()
    table.string('orderedByLastName', '40').notNullable()
    table.string('orderedByEmail', '100').notNullable()
    // table.string('willCallFirstName').notNullable().defaultTo('orderedByFirstName')
    // table.string('willCallLastName').notNullable().defaultTo('orderedByLastName')
    // table.integer('eventId').notNullable()
    // table.foreign('eventId').references('events.id').onDelete('CASCADE')
    // table.integer('pickupLocationId').notNullable()
    // table.foreign('pickupLocationId').onDelete('CASCADE').references('pickup_locations.id')
    // table.integer('discountCodeId')
    // table.foreign('discountCodeId').references('discount_codes.id')
    // table.string('status').notNullable().defaultTo('1')
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("orders")
};
