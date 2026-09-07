const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_fBX2WwQ0plkM@ep-lingering-paper-ay0jsxb9-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
pool.query("ALTER TABLE activation_codes ALTER COLUMN plan DROP DEFAULT;", (err, res) => {
  if (err) console.error(err);
  else console.log('Default dropped');
  pool.end();
});
