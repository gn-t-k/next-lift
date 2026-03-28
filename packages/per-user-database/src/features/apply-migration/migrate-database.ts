import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import type * as schema from "../../database-schemas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../../drizzle");

export const migrateDatabase = async (db: LibSQLDatabase<typeof schema>) => {
	await migrate(db, { migrationsFolder });
};
