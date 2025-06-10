import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcrypt';

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'industrial_db',
  password: 'PG',
  port: 5432,
});

async function init() {
  try {
    await client.connect();

    // 1. Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        department_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) CHECK (role IN ('senior', 'junior')),
        department_id INT REFERENCES departments(department_id),
        location_id INT REFERENCES locations(location_id),
        designation VARCHAR(100) NOT NULL,
        reporting_to INT REFERENCES users(user_id),
        area VARCHAR(50)
      );
    `);





    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON sessions (expire);
    `);
    console.log('✅ Tables created');

    // 2. Insert departments and locations
    await client.query(`
      INSERT INTO departments (name) 
      VALUES ('Production'), ('Sales'), ('HR')
      ON CONFLICT DO NOTHING;
    `);

    await client.query(`
      INSERT INTO locations (name) 
      VALUES ('Corporate Office (Bhubaneswar)'), ('Damanjodi Complex')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Insert all seniors first (reporting_to: null)
    const seniorUsers = [
      // name, email, plainPassword, role, department_id, location_id, designation, area
      ['Shri Brijendra Pratap Singh', 'cmd@company.co.in', 'Cmd@2024#', 'senior', 1, 1, 'CMD', 'All'],
      ['Shri Pankaj Kumar Sharma', 'pankaj.sharma@company.co.in', 'Pankaj!Prod88', 'senior', 1, 1, 'Director (Production)', 'All'],
      ['Shri Anuj Kumar Panda', 'anuj.panda@company.co.in', 'AnujP@1234!', 'senior', 1, 2, 'GGM (Production)', 'Damanjodi'],
      ['Shri Niranjan Samal', 'niranjan.samal@company.co.in', 'Niranjan#Mine7', 'senior', 1, 2, 'ED (Mines & Refinery)', 'Damanjodi'],
      ['Shri Sadashiv Samantaray', 'sadashiv.samantaray@company.co.in', 'Sada$Com2024', 'senior', 2, 1, 'Director (Commercial)', 'All'],
      ['Shri J Rajesh Kapoor', 'edmktg@company.co.in', 'Rajesh@Mktg!', 'senior', 2, 1, 'ED (Marketing)', 'Damanjodi'],
      ['Shri Gautam Mohapatra', 'gautam.mohapatra@company.co.in', 'GautamMktg#55', 'senior', 2, 1, 'GGM (Marketing)', 'Damanjodi'],
      ['Dr. Tapas Kumar Pattanayak', 'tapas.pattanayak@company.co.in', 'TapasHR@321', 'senior', 3, 1, 'Director (HR)', 'All'],
      ['Shri Himanshu Sekhar Pradhan', 'himanshu.pradhan@company.co.in', 'Himanshu!HA9', 'senior', 3, 1, 'GGM (H&A)', 'Damanjodi'],
    ];

    // Map to store email -> user_id for reporting_to
    const emailToId = {};

    for (const [name, email, plainPassword, role, deptId, locId, designation, area] of seniorUsers) {
      const hash = await bcrypt.hash(plainPassword, 10);
      let userId;
      try {
        const res = await client.query(`
          INSERT INTO users 
            (name, email, password, role, department_id, location_id, designation, reporting_to, area)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)
          ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            department_id = EXCLUDED.department_id,
            location_id = EXCLUDED.location_id,
            designation = EXCLUDED.designation,
            reporting_to = NULL,
            area = EXCLUDED.area
          RETURNING user_id;
        `, [name, email, hash, role, deptId, locId, designation, area]);
        userId = res.rows[0].user_id;
        emailToId[email] = userId;
      } catch (err) {
        console.error(`❌ Failed to insert senior user ${email}:`, err.message);
      }
    }

    // 4. Insert juniors (reference reporting_to by senior email)
    const juniorUsers = [
      // name, email, plainPassword, role, department_id, location_id, designation, reporting_to_email, area
      ['Rajeshwari Patil', 'rajeshwari.patil@company.co.in', 'RajeshwariP@2024', 'junior', 1, 2, 'DGM (Production)', 'anuj.panda@company.co.in', 'Damanjodi'],
      ['Vikram Singh Rathore', 'vikram.rathore@company.co.in', 'VikramRathore#1', 'junior', 1, 2, 'AGM (Production)', 'rajeshwari.patil@company.co.in', 'Damanjodi'],
      ['Sunil Kumar Nayak', 'sunil.nayak@company.co.in', 'SunilN@Cm2024', 'junior', 1, 2, 'CM (Production)', 'vikram.rathore@company.co.in', 'Damanjodi'],
      ['Priya Ranjan Sahu', 'priya.sahu@company.co.in', 'PriyaSahu!Sm', 'junior', 1, 2, 'SM (Production)', 'sunil.nayak@company.co.in', 'Damanjodi'],
      ['Rakesh Tripathy', 'rakesh.tripathy@company.co.in', 'RakeshT@Mngr', 'junior', 1, 2, 'Manager (Production)', 'priya.sahu@company.co.in', 'Damanjodi'],
      ['Sourav Das', 'sourav.das@company.co.in', 'SouravDas@1', 'junior', 1, 2, 'Officer (Production)', 'rakesh.tripathy@company.co.in', 'Damanjodi'],

      ['Priyanka Deshmukh', 'priyanka.deshmukh@company.co.in', 'PriyankaD@2024', 'junior', 2, 1, 'DGM (Sales)', 'gautam.mohapatra@company.co.in', 'Corporate'],
      ['Arvind Reddy', 'arvind.reddy@company.co.in', 'ArvindReddy#2', 'junior', 2, 1, 'AGM (Sales)', 'priyanka.deshmukh@company.co.in', 'Corporate'],
      ['Mehul Jain', 'mehul.jain@company.co.in', 'MehulJain@Cm', 'junior', 2, 1, 'CM (Sales)', 'arvind.reddy@company.co.in', 'Corporate'],
      ['Kavita Sharma', 'kavita.sharma@company.co.in', 'KavitaS@Sm', 'junior', 2, 1, 'SM (Sales)', 'mehul.jain@company.co.in', 'Corporate'],
      ['Amit Kumar', 'amit.kumar@company.co.in', 'AmitKumar!M', 'junior', 2, 1, 'Manager (Sales)', 'kavita.sharma@company.co.in', 'Corporate'],
      ['Pooja Singh', 'pooja.singh@company.co.in', 'PoojaSingh@1', 'junior', 2, 1, 'Officer (Sales)', 'amit.kumar@company.co.in', 'Corporate'],

      ['Anjali Mehta', 'anjali.mehta@company.co.in', 'AnjaliM@Hr', 'junior', 3, 1, 'DGM (HR)', 'himanshu.pradhan@company.co.in', 'Corporate'],
      ['Rohan Verma', 'rohan.verma@company.co.in', 'RohanVerma@2', 'junior', 3, 1, 'AGM (HR)', 'anjali.mehta@company.co.in', 'Corporate'],
      ['Deepak Sahu', 'deepak.sahu@company.co.in', 'DeepakSahu@Cm', 'junior', 3, 1, 'CM (HR)', 'rohan.verma@company.co.in', 'Corporate'],
      ['Sneha Mishra', 'sneha.mishra@company.co.in', 'SnehaMishra!Sm', 'junior', 3, 1, 'SM (HR)', 'deepak.sahu@company.co.in', 'Corporate'],
      ['Rahul Sharma', 'rahul.sharma@company.co.in', 'RahulSharma@M', 'junior', 3, 1, 'Manager (HR)', 'sneha.mishra@company.co.in', 'Corporate'],
      ['Nikita Patel', 'nikita.patel@company.co.in', 'NikitaPatel@1', 'junior', 3, 1, 'Officer (HR)', 'rahul.sharma@company.co.in', 'Corporate']
    ];

    for (const [name, email, plainPassword, role, deptId, locId, designation, reportingToEmail, area] of juniorUsers) {
      const hash = await bcrypt.hash(plainPassword, 10);
      let reportingTo = null;
      if (reportingToEmail && emailToId[reportingToEmail]) {
        reportingTo = emailToId[reportingToEmail];
      } else if (reportingToEmail) {
        // Try to look up user_id from DB if not in map
        const res = await client.query(`SELECT user_id FROM users WHERE email = $1`, [reportingToEmail]);
        if (res.rows.length > 0) {
          reportingTo = res.rows[0].user_id;
          emailToId[reportingToEmail] = reportingTo;
        }
      }
      try {
        await client.query(`
          INSERT INTO users 
            (name, email, password, role, department_id, location_id, designation, reporting_to, area)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            department_id = EXCLUDED.department_id,
            location_id = EXCLUDED.location_id,
            designation = EXCLUDED.designation,
            reporting_to = EXCLUDED.reporting_to,
            area = EXCLUDED.area;
        `, [name, email, hash, role, deptId, locId, designation, reportingTo, area]);
      } catch (err) {
        console.error(`❌ Failed to insert junior user ${email}:`, err.message);
      }
    }

    console.log('✅ All users inserted/updated with hashed passwords');

  } catch (err) {
    console.error('DB initialization failed:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🎉 Database initialized successfully');
  }
}

init();
