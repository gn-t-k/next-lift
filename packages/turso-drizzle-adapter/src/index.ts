export { applyMigrations } from "./apply-migrations";
export { createDrizzleFromTursoDatabase } from "./create-drizzle-from-turso-database";
export { createTursoDatabaseHandle } from "./create-turso-database-handle";

// drizzle のドライバ間で共通に扱える run 結果の最小契約。libsql の `ResultSet` と sqlite-proxy の `SqliteRemoteResult` の両方が assignable であり、利用側で `result.rowsAffected === 0` を判定する必要があるため `rowsAffected` を含める
export type SqliteRunResult = {
	rows?: unknown[];
	rowsAffected?: number;
};
