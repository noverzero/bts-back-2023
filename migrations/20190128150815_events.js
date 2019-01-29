exports.up = (knex, Promise) => {
  return knex.schema.createTable("events",(table)=>{
    table.increments()
    table.date("date").notNullable()
    table.time("startTime").notNullable()
    table.string("venue").notNullable().defaultTo("")
    table.string("headliner").notNullable().defaultTo("")
    table.string("support1").defaultTo("")
    table.string("support2").defaultTo("")
    table.string("support3").defaultTo("")
    table.text("headlinerBio", "longtext").defaultTo("")
    table.string("headlinerImgLink").defaultTo("")
    table.boolean("meetsCriteria").notNullable().defaultTo(true)
    table.boolean("isDenied").notNullable().defaultTo(false)
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("events")
}
