
exports.up = function(knex, Promise) {
  return knex.schema.createTable('pickup_parties', (table) => {
    table.increments('id')
    table.integer('pickupLocationId').notNullable()
    table.foreign('pickupLocationId').references('pickup_locations.id')
    table.integer('eventId').notNullable()
    table.foreign('eventId').references('events.id')
    table.date('eventDate').notNullable()
    table.string('eventVenue').notNullable()
    table.time('lastBusDeparts').notNullable()
    table.integer('orderId').notNullable()
      table.foreign('orderId').references('orders.id')
    table.integer('ordersReservationId').notNullable()
    table.string('ordersWillCallName').notNullable()
    table.integer('checkedInPasscode')
    table.integer('sold').notNullable().defaultTo(0)
    table.integer('capacity').notNullable().defaultTo(44)
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("pickup_parties")
};
