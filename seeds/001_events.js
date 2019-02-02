
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        { id: 1,
          date: '01/01/2020',
          startTime: '18:00:00',
          venue: '',
          headliner: '',
          support1: '',
          support2: '',
          support3: '',
          headlinerBio: ``,
          headlinerImgLink: ``
        },
      ])
      .then(() => {
        return knex.raw("SELECT setval('events_id_seq', (SELECT MAX(id) FROM events))")
      })
    })
}
