exports.up = (knex, Promise) => {
  return knex.schema.createTable("events",(table)=>{
    table.increments()
    table.string("venue").notNullable().defaultTo("")
    table.string("headliner").notNullable().defaultsTo("")
    table.date("date")
    table.time("startTime")
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("events")
}
