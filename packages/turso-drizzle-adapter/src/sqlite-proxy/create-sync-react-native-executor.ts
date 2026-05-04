import type { Database, SQLiteValue } from "@tursodatabase/sync-react-native";
import type { SqliteExecutor } from "./executor";

// sync-react-native の Statement.all/get は Row（{ [columnName]: SQLiteValue }）を返すため、columns 順の配列に変換する。Row は readRow() / getAllRows() で columnCount 順に挿入されており、ECMAScript の string キー挿入順保証により Object.values の順序が columns 順と一致する
const toColumnArray = (row: Record<string, unknown>): unknown[] => {
	return Object.values(row);
};

export const createSyncReactNativeExecutor = (
	database: Database,
): SqliteExecutor => ({
	exec: async (sql) => {
		await database.exec(sql);
	},
	run: async (sql, params) => {
		const result = await database.run(sql, ...(params as SQLiteValue[]));
		return {
			rowsAffected: result.changes,
			lastInsertRowid: result.lastInsertRowid,
		};
	},
	all: async (sql, params) => {
		const rows = await database.all(sql, ...(params as SQLiteValue[]));
		return rows.map(toColumnArray);
	},
	get: async (sql, params) => {
		const row = await database.get(sql, ...(params as SQLiteValue[]));
		if (row === undefined) return undefined;
		return toColumnArray(row);
	},
});
