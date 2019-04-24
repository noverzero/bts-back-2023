exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex('reservations').del()
    .then(() => {
      // Inserts seed entries
      return knex('reservations').insert(
      )
    })
    .then(() => {
      return knex.raw("SELECT setval('reservations_id_seq', (SELECT MAX(id) FROM reservations))")
    })
}
