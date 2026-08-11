const { db } = require('./src/db/index');
const { activationCodes } = require('./src/db/schema');
const { desc } = require('drizzle-orm');

async function main() {
  const codes = await db.select().from(activationCodes).orderBy(desc(activationCodes.createdAt)).limit(5);
  console.log(codes);
  process.exit(0);
}
main();
