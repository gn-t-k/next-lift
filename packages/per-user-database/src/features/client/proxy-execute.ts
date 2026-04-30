import type { Database } from "@tursodatabase/database";

export type SqliteProxyMethod = "run" | "all" | "values" | "get";

export type SqliteProxyResult = { rows: unknown[] };

export const proxyExecute = async (
	db: Database,
	sql: string,
	params: unknown[],
	method: SqliteProxyMethod,
): Promise<SqliteProxyResult> => {
	if (method === "run") {
		await db.prepare(sql).run(...params);
		return { rows: [] };
	}

	const stmt = db.prepare(sql).raw(true);

	if (method === "get") {
		const row = await stmt.get(...params);
		return { rows: row ?? [] };
	}

	const rows = await stmt.all(...params);
	return { rows };
};
