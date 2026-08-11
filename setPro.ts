import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = "andreykz520@gmail.com";
  
  await db.update(users).set({ isPro: true }).where(eq(users.email, email));
  console.log("User updated to PRO");
}
main().catch(console.error);
