
const Pool = require('pg').Pool


require('dotenv').config();
const parse = require("pg-connection-string").parse;
// Parse the environment variable into an object
const pgconfig = parse(process.env.DATABASE_URL);
pgconfig.ssl = { rejectUnauthorized: false };
const pool = new Pool(pgconfig)


