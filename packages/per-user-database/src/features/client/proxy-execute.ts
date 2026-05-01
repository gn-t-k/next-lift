import type { Database } from "@tursodatabase/database";

export type SqliteProxyMethod = "run" | "all" | "values" | "get";

export type SqliteProxyResult = {
	rows: unknown[];
	rowsAffected?: number;
	lastInsertRowid?: number;
};

export const proxyExecute = async (
	db: Database,
	sql: string,
	params: unknown[],
	method: SqliteProxyMethod,
): Promise<SqliteProxyResult> => {
	if (method === "run") {
		// drizzle sqlite-proxy は run の戻り値をそのまま呼び出し側へ透過するため、rowsAffected / lastInsertRowid を含めて返す（型は drizzle 公開型に含まれていないが、利用側で `result.rowsAffected === 0` 等のチェックを行うため）
		const result = await db.prepare(sql).run(...params);
		return {
			rows: [],
			rowsAffected: result.changes,
			lastInsertRowid: result.lastInsertRowid,
		};
	}

	// drizzle sqlite-proxy は values モード（行をカラム値の配列）で結果を期待するため raw に切り替える
	const stmt = db.prepare(sql).raw(true);

	if (method === "get") {
		const row = await stmt.get(...params);
		return { rows: row ?? [] };
	}

	const rows = await stmt.all(...params);
	return { rows };
};
