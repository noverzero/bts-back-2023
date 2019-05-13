exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex('pickup_parties').del()
    .then(() => {
      // Inserts seed entries
      // return knex('pickup_parties').insert(
      // )
    })
    .then(() => {
      return knex.raw("SELECT setval('pickup_parties_id_seq', (SELECT MAX(id) FROM pickup_parties))")
    })
}
