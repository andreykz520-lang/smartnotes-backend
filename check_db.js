const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_fBX2WwQ0plkM@ep-lingering-paper-ay0jsxb9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name='activation_codes'", (err, res) => {
  console.table(res.rows);
  pool.end();
});
