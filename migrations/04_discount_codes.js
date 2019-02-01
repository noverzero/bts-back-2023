
exports.up = (knex, Promise) => {
  return knex.schema.createTable("discount_codes",(table)=>{
    table.increments('id')
    table.string("discountCode").notNullable()
    table.integer("percentage").notNullable().defaultTo(0)
    table.date("expiresOn").notNullable().defaultTo(20190101)
    table.date("issuedOn")
    table.string("issuedTo")
    table.string("issuedBy")
    table.string("issuedBecause")
    table.integer("timesUsed").notNullable().defaultTo(0)
    table.integer("type").notNullable().defaultTo(1)
    table.integer("remainingUses").notNullable().defaultTo(0)
    table.integer("usesPerEvent").notNullable().defaultTo(0)
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("discount_codes")
}
