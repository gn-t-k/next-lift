import type { Client } from "@tursodatabase/serverless/compat";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createServerlessExecutor } from "./sqlite-proxy/create-serverless-executor";
import { proxyExecute } from "./sqlite-proxy/proxy-execute";

// Drizzle 公式が @tursodatabase/* 用ドライバーを提供したら剥がす暫定アダプタ。現状スコープは sqlite-proxy 経由の橋渡しのみ（ADR-029）
export const createDrizzleFromTursoServerless = <
	TSchema extends Record<string, unknown>,
>(
	client: Client,
	schema: TSchema,
) => {
	const executor = createServerlessExecutor(client);
	return drizzle(
		async (sql, params, method) => proxyExecute(executor, sql, params, method),
		{ schema },
	);
};
