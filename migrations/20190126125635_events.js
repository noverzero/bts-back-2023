exports.up = (knex, Promise) => {
  return knex.schema.createTable("events",(table)=>{
    table.increments()
    table.date("date").notNullable()
    table.time("startTime").notNullable()
    table.string("venue").notNullable().defaultTo("")
    table.string("headliner").notNullable().defaultsTo("")
    table.string("support1").defaultTo("")
    table.string("support2").defaultsTo("")
    table.string("support3").defaultTo("")
    table.boolean("meetsCriteria").notNullable().defaultsTo(true)
    table.boolean("isDenied").notNullable().defaultsTo(false)
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("events")
}
