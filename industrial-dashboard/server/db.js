// server/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',            // <-- your PostgreSQL username
  host: 'localhost',
  database: 'industrial_db', // <-- your database name
  password: 'PG',    // <-- your PostgreSQL password
  port: 5432,
});
