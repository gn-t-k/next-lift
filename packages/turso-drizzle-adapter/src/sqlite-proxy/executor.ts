// `@tursodatabase/database` / `@tursodatabase/serverless/compat` 等のドライバを sqlite-proxy 経由で drizzle に橋渡しするための最小契約。各ドライバ用の wrapper（`create-database-executor` / `create-serverless-executor`）でこの形に揃える
export type SqliteExecutor = {
	exec: (sql: string) => Promise<void>;
	run: (
		sql: string,
		params: unknown[],
	) => Promise<{ rowsAffected: number; lastInsertRowid?: number }>;
	all: (sql: string, params: unknown[]) => Promise<unknown[][]>;
	get: (sql: string, params: unknown[]) => Promise<unknown[] | undefined>;
};
