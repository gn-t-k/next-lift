import type { SqliteExecutor } from "./executor";

export type SqliteProxyMethod = "run" | "all" | "values" | "get";

export type SqliteProxyResult = {
	rows: unknown[];
	rowsAffected?: number;
	lastInsertRowid?: number;
};

export const proxyExecute = async (
	executor: SqliteExecutor,
	sql: string,
	params: unknown[],
	method: SqliteProxyMethod,
): Promise<SqliteProxyResult> => {
	if (method === "run") {
		// drizzle sqlite-proxy は run の戻り値をそのまま呼び出し側へ透過するため、rowsAffected / lastInsertRowid を含めて返す（型は drizzle 公開型に含まれていないが、利用側で `result.rowsAffected === 0` 等のチェックを行うため）
		const result = await executor.run(sql, params);
		if (result.lastInsertRowid === undefined) {
			return { rows: [], rowsAffected: result.rowsAffected };
		}
		return {
			rows: [],
			rowsAffected: result.rowsAffected,
			lastInsertRowid: result.lastInsertRowid,
		};
	}

	if (method === "get") {
		const row = await executor.get(sql, params);
		return { rows: row ?? [] };
	}

	const rows = await executor.all(sql, params);
	return { rows };
};
