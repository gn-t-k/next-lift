import type { Client, InValue } from "@tursodatabase/serverless/compat";
import type { SqliteExecutor } from "./executor";

const toColumnArray = (row: Record<string, unknown>, columns: string[]) => {
	return columns.map((column) => row[column]);
};

export const createServerlessExecutor = (client: Client): SqliteExecutor => ({
	exec: async (sql) => {
		await client.execute(sql);
	},
	run: async (sql, params) => {
		const result = await client.execute(sql, params as InValue[]);
		// exactOptionalPropertyTypes: true のため、lastInsertRowid が undefined の場合はプロパティ自体を含めない
		if (result.lastInsertRowid === undefined) {
			return { rowsAffected: result.rowsAffected };
		}
		return {
			rowsAffected: result.rowsAffected,
			lastInsertRowid: Number(result.lastInsertRowid),
		};
	},
	all: async (sql, params) => {
		const result = await client.execute(sql, params as InValue[]);
		return result.rows.map((row) => toColumnArray(row, result.columns));
	},
	get: async (sql, params) => {
		const result = await client.execute(sql, params as InValue[]);
		const first = result.rows[0];
		if (first === undefined) return undefined;
		return toColumnArray(first, result.columns);
	},
});
