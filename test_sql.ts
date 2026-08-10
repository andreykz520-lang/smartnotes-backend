import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from 'drizzle-orm';

async function run() {
  try {
    const { db } = await import('./src/db');
    await db.execute(sql`ALTER TABLE users ADD COLUMN device_resets_count integer DEFAULT 0 NOT NULL`);
    console.log('done');
  } catch (err: any) {
    if (err.message.includes('already exists') || err.message.includes('duplicate column')) {
      console.log('Column already exists');
    } else {
      console.error(err);
    }
  }
}
run();
