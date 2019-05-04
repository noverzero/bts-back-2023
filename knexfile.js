// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: 'postgresql://localhost:5432/bts_q3'
  },
  test: {
    client: 'pg',
    connection: 'postgresql://localhost:5432/bts_q3_test'
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  },
}
