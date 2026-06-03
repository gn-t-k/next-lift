import type { Database } from "@tursodatabase/database";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createDatabaseExecutor } from "../../sqlite-proxy/create-database-executor";
import { proxyExecute } from "../../sqlite-proxy/proxy-execute";

// Drizzle 公式が @tursodatabase/* 用ドライバーを提供したら剥がす暫定アダプタ。現状スコープは sqlite-proxy 経由の橋渡しのみ（ADR-029）
export const createDrizzleFromTursoDatabase = <
	TSchema extends Record<string, unknown>,
>(
	database: Database,
	schema: TSchema,
) => {
	const executor = createDatabaseExecutor(database);
	return drizzle(
		async (sql, params, method) => proxyExecute(executor, sql, params, method),
		{ schema },
	);
};
