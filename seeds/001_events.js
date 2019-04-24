exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert(
      )
      .then(() => {
        return knex.raw("SELECT setval('events_id_seq', (SELECT MAX(id) FROM events))")
      })
    })
}
