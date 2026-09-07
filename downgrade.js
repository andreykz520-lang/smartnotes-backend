const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_fBX2WwQ0plkM@ep-lingering-paper-ay0jsxb9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

pool.query(`
  UPDATE users 
  SET 
    pro_started_at = created_at,
    pro_ended_at = created_at + interval '3 days'
  WHERE 
    email NOT IN ('andreykz@yahoo.com', 'andreykz520@gmail.com', 'autoneuro24@gmail.com') 
    AND (pro_started_at IS NULL OR pro_ended_at IS NULL);
`, (err, res) => {
  if (err) console.error(err);
  else console.log('Updated rows:', res.rowCount);
  pool.end();
});
