import type { Database } from "@tursodatabase/sync-react-native";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createSyncReactNativeExecutor } from "../../sqlite-proxy/create-sync-react-native-executor";
import { proxyExecute } from "../../sqlite-proxy/proxy-execute";

// Drizzle 公式が @tursodatabase/* 用ドライバーを提供したら剥がす暫定アダプタ。現状スコープは sqlite-proxy 経由の橋渡しのみ（ADR-029）
export const createDrizzleFromSyncReactNative = <
	TSchema extends Record<string, unknown>,
>(
	database: Database,
	schema: TSchema,
) => {
	const executor = createSyncReactNativeExecutor(database);
	return drizzle(
		async (sql, params, method) => proxyExecute(executor, sql, params, method),
		{ schema },
	);
};
