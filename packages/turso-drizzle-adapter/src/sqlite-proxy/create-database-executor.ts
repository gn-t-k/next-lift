import type { Database } from "@tursodatabase/database";
import type { SqliteExecutor } from "./executor";

export const createDatabaseExecutor = (database: Database): SqliteExecutor => ({
	exec: async (sql) => {
		await database.exec(sql);
	},
	run: async (sql, params) => {
		const result = await database.prepare(sql).run(...params);
		return {
			rowsAffected: result.changes,
			lastInsertRowid: result.lastInsertRowid,
		};
	},
	all: async (sql, params) => {
		return await database
			.prepare(sql)
			.raw(true)
			.all(...params);
	},
	get: async (sql, params) => {
		const row = await database
			.prepare(sql)
			.raw(true)
			.get(...params);
		return row;
	},
});
