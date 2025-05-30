/*
import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'industrial_db',
  password: 'PG', // <-- your actual password
  port: 5432,
});

async function updateUsers() {
  await client.connect();

  // Set strong passwords for each user
  const users = [
    { email: 'ceo@company.com', password: 'Ceo@1234' },
    { email: 'cto@company.com', password: 'Cto@1234' },
    { email: 'manager@company.com', password: 'Manager@1234' },
    { email: 'analyst@company.com', password: 'Analyst@1234' },
    { email: 'junior1@company.com', password: 'Junior1@1234' },
    { email: 'junior2@company.com', password: 'Junior2@1234' }
  ];

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hash, user.email]
    );
    console.log(`Updated password for ${user.email}`);
  }

  await client.end();
}

updateUsers().catch(console.error);
*/