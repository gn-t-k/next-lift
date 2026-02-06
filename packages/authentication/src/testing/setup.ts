import fs from "node:fs";
import path from "node:path";
import { mockPrivateEnv } from "@next-lift/env/testing";
import { sql } from "drizzle-orm";
import { beforeEach, vi } from "vitest";

mockPrivateEnv({
	TURSO_TOKEN_ENCRYPTION_KEY: "0".repeat(64),
});

const { mockedAuthenticationDatabase } = await vi.hoisted(async () => {
	const { createClient } = await import("@libsql/client");
	const { drizzle } = await import("drizzle-orm/libsql");
	const schema = await import("../database-schemas");
	const client = createClient({ url: ":memory:" });
	return { mockedAuthenticationDatabase: drizzle(client, { schema }) };
});

export { mockedAuthenticationDatabase };

vi.mock("../helpers/get-database", () => ({
	getDatabase: () => mockedAuthenticationDatabase,
}));

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

beforeEach(async () => {
	await dropAllTables();
	await executeMigrationFiles();
});
