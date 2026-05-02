import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyMigrationsToTursoServerless } from "@next-lift/turso-drizzle-adapter/serverless";
import type { Client } from "@tursodatabase/serverless/compat";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../../drizzle");

export const migrateDatabase = async (client: Client) => {
	await applyMigrationsToTursoServerless(client, migrationsFolder);
};
