// drizzle のドライバ間で共通に扱える run 結果の最小契約。libsql の `ResultSet` と sqlite-proxy の `SqliteRemoteResult` の両方が assignable であり、利用側で `result.rowsAffected === 0` を判定する必要があるため `rowsAffected` を含める
export type SqliteRunResult = {
	rows?: unknown[];
	rowsAffected?: number;
};
