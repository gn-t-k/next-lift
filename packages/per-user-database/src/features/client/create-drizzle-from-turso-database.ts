import type { Database } from "@tursodatabase/database";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { schema } from "../../database-schemas";
import { proxyExecute } from "./proxy-execute";

// Drizzle 公式が @tursodatabase/* 用ドライバーを提供したら剥がす暫定アダプタ。現状スコープは sqlite-proxy 経由の橋渡しのみ（ADR-029）
export const createDrizzleFromTursoDatabase = (database: Database) => {
	return drizzle(
		async (sql, params, method) => proxyExecute(database, sql, params, method),
		{ schema },
	);
};
