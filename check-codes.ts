import { db } from './src/db/index';
import { activationCodes } from './src/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const codes = await db.select().from(activationCodes).orderBy(desc(activationCodes.createdAt)).limit(5);
  console.log(codes);
  process.exit(0);
}
main();
