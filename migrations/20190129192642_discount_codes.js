
exports.up = (knex, Promise) => {
  return knex.schema.createTable("discount_codes",(table)=>{
    table.increments('id')
    table.text("discountCode").notNullable()
    table.integer("percentage").notNullable()
    // table.date("exipresOn").notNullable()
    // table.date("issuedOn").notNullable()
    table.text("issuedTo")
    table.text("issuedBy")
    table.text("issuedBecause")
    table.integer('eventId').notNullable()
      table.foreign('eventId').references('events.id').onDelete('CASCADE')
    table.text("appliesTo")
    table.integer("timesUsed")
    table.string("type").defaultTo("standard")
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("discount_codes")
}
