const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  max: 90,
  idleTimeoutMillis: 0,
});

async function query(text, values) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(text, values);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
  } finally {
    await client.release();
  }
}

function dropTables() {
  query(`DROP TABLE IF EXISTS appointments;`)
    .then(() => query(`DROP TABLE IF EXISTS services;`))
    .then(() => query(`DROP TABLE IF EXISTS users;`))
    .then(() => query(`DROP TABLE IF EXISTS schedules;`))
    .then(() => query(`DROP TABLE IF EXISTS contractors;`))
    .catch(err => console.log(err));
}

dropTables();
setTimeout(() => pool.end(), 5000);
