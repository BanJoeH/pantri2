import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { getClient, getDbWithClient } from "./drizzle/db";

const client = getClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = getDbWithClient({ client });
// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: "./drizzle/migrations" });
// Don't forget to close the connection, otherwise the script will hang
client.close();
