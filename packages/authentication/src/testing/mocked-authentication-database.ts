import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { beforeEach } from "vitest";
import * as schema from "../database-schemas";

const client = createClient({ url: ":memory:" });
export const mockedAuthenticationDatabase = drizzle(client, { schema });

beforeEach(async () => {
	await dropAllTables();
	await executeMigrationFiles();
});

const executeMigrationFiles = async () => {
	const drizzleDir = path.join(__dirname, "../../drizzle");
	const sqlFiles = fs
		.readdirSync(drizzleDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	for (const file of sqlFiles) {
		const sqlContent = fs.readFileSync(path.join(drizzleDir, file), "utf-8");
		const statements = sqlContent.split("--> statement-breakpoint");
		for (const stmt of statements) {
			const trimmed = stmt.trim();
			if (trimmed) {
				await mockedAuthenticationDatabase.run(sql.raw(trimmed));
			}
		}
	}
};

const dropAllTables = async () => {
	await mockedAuthenticationDatabase.run(sql`PRAGMA foreign_keys = OFF`);

	const tables = await mockedAuthenticationDatabase.all<{ name: string }>(
		sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
	);

	for (const { name } of tables) {
		await mockedAuthenticationDatabase.run(
			sql.raw(`DROP TABLE IF EXISTS "${name}"`),
		);
	}

	await mockedAuthenticationDatabase.run(sql`PRAGMA foreign_keys = ON`);
};
