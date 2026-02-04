import fs from "node:fs";
import path from "node:path";
import { mockPrivateEnv } from "@next-lift/env/private/private.mock";
import { sql } from "drizzle-orm";
import { beforeEach, vi } from "vitest";

mockPrivateEnv({
	TURSO_PER_USER_DATABASE_PREFIX: "next-lift-test",
});

// 通常のトップレベルawaitや同期importを使わない理由は、vitestによるモックより前にメモリDBを初期化したいから。
// テストでデータ検証に使用するためexportしておく。
const { mockedPerUserDatabase } = await vi.hoisted(async () => {
	const { createClient } = await import("@libsql/client");
	const { drizzle } = await import("drizzle-orm/libsql");
	const client = createClient({ url: ":memory:" });
	return { mockedPerUserDatabase: drizzle(client) };
});

export { mockedPerUserDatabase };

// drizzle/ディレクトリからマイグレーションSQLファイルを読み込み、各ステートメントを順に実行する
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
				await mockedPerUserDatabase.run(sql.raw(trimmed));
			}
		}
	}
};

const dropAllTables = async () => {
	await mockedPerUserDatabase.run(sql`PRAGMA foreign_keys = OFF`);

	const tables = await mockedPerUserDatabase.all<{ name: string }>(
		sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
	);

	for (const { name } of tables) {
		await mockedPerUserDatabase.run(sql.raw(`DROP TABLE IF EXISTS "${name}"`));
	}

	await mockedPerUserDatabase.run(sql`PRAGMA foreign_keys = ON`);
};

beforeEach(async () => {
	await dropAllTables();
	await executeMigrationFiles();
});
