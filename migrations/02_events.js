exports.up = (knex, Promise) => {
  return knex.schema.createTable("events",(table)=>{
    table.increments('id')
    table.date("dateTime").notNullable()
    table.string("venue").notNullable().defaultTo("")
    table.string("headliner").notNullable().defaultTo("")
    table.string("support1").defaultTo("")
    table.string("support2").defaultTo("")
    table.string("support3").defaultTo("")
    table.string("headlinerBio", '100000').defaultTo(``)
    table.string("headlinerImgLink").defaultTo(``)
    table.boolean("meetsCriteria").notNullable().defaultTo(true)
    table.boolean("isDenied").notNullable().defaultTo(false)
    table.timestamps(true,true)
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable("events")
}
