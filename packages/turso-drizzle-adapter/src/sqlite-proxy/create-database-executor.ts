import type { Database } from "@tursodatabase/database";
import type { SqliteExecutor } from "./executor";

export const createDatabaseExecutor = (database: Database): SqliteExecutor => ({
	exec: async (sql) => {
		await database.exec(sql);
	},
	run: async (sql, params) => {
		const statement = await database.prepare(sql);
		const result = await statement.run(...params);
		return {
			rowsAffected: result.changes,
			lastInsertRowid: result.lastInsertRowid,
		};
	},
	all: async (sql, params) => {
		const statement = await database.prepare(sql);
		return await statement.raw(true).all(...params);
	},
	get: async (sql, params) => {
		const statement = await database.prepare(sql);
		const row = await statement.raw(true).get(...params);
		return row;
	},
});
