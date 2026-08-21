const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_fBX2WwQ0plkM@ep-lingering-paper-ay0jsxb9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  const users = await pool.query('SELECT * FROM users WHERE email = $1', ['andreykz520@gmail.com']);
  console.log('User in DB:', users.rows);
  if (users.rows.length > 0) {
    const devices = await pool.query('SELECT * FROM devices WHERE user_id = $1', [users.rows[0].id]);
    console.log('Devices attached:', devices.rows);
  }
  await pool.end();
}

main().catch(console.error);
