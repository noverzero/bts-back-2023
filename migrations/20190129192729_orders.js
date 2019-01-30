
exports.up = function(knex, Promise) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id')
    table.integer('pickupLocationId').notNullable()
      table.foreign('pickupLocationId').onDelete('CASCADE').references('pickup_locations.id')
    table.integer('eventId').notNullable()
      table.foreign('eventId').references('events.id').onDelete('CASCADE')
    table.integer('reservationId').notNullable()
      table.string('reservationWillCallName').notNullable()
    table.integer('discountCodeId')
      table.foreign('discountCodeId').references('discount_codes.id')
    table.string('status').notNullable().defaultTo('1')
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("orders")
};
