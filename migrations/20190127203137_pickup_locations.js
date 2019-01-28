
exports.up = (knex, Promise) => {
  return knex.schema.createTable("pickup_locations",(table)=>{
    table.increments()
    table.text("streetAddress").notNullable()
    table.text("city").notNullable()
    table.text("locationName").notNullable()
    table.float("latitude").defaultTo()
    table.float("longitude").defaultsTo()
    table.string("type").defaultTo("standard")
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("pickup_locations")
}
