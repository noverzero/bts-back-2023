const {util, seed} = require('data-seed')
const firstNameSeed = () => { return seed.name.en.firstName() }
const lastNameSeed = () => { return seed.name.en.lastName() }
const seedEmail = () => { return seed.email() }
const preferredLocationSeed = (arr) => { return  arr[Math.floor(Math.random() * arr.length)] }

const generateUsersSeeds = (num) => {
  let users = []
  for (let i = 0; i < num; i++) {
      users.push(
        {firstName: firstNameSeed(), lastName: lastNameSeed(), email: seedEmail(), phone: '111-111-11111', preferredLocation: preferredLocationSeed(['Denver', 'Boulder', 'Fort Collins', 'Longmont', '']), isStaff: false, isDriver: false, isAdmin: false, isDeactivated: false}
      )
  }
  return users
}
const adminTest = { firstName: 'admin', lastName: 'test', phone: '111-111-11111', email: 'admintest@nobody.com', isStaff: false, isDriver: false, isAdmin: true, isDeactivated: false }
const staffTest = { firstName: 'staff', lastName: 'test', phone: '111-111-11111', email: 'stafftest@nobody.com', isStaff: true, isDriver: false, isAdmin: false, isDeactivated: false }
const driverTest = { firstName: 'driver', lastName: 'test', phone: '111-111-11111', email: 'drivertest@nobody.com', isStaff: false, isDriver: true, isAdmin: false, isDeactivated: false }
const deactivatedTest = { firstName: 'deactivated', lastName: 'test', phone: '111-111-11111', email: 'deactivatedtest@nobody.com', isStaff: false, isDriver: false, isAdmin: false, isDeactivated: true }

exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(() => {
      // Inserts seed entries
      // return knex('users').insert([...generateUsersSeeds(100), adminTest, staffTest, driverTest, deactivatedTest])
    })
    .then(() => {
      return knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))")
    })
}

//user types = {standard, staff, driver, admin, deactivated}
