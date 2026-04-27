import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../database-schemas";

export type DatabaseConfig = {
	url: string;
	authToken: string;
};

// libSQLは SQLITE_DEFAULT_FOREIGN_KEYS=1 でビルドされておりデフォルトでFK制約が効くが、
// 未文書化の実装詳細であり将来変わるリスクがあるため、接続時に明示的に有効化する（ADR-026）
export const createPerUserDatabaseClient = async (config: DatabaseConfig) => {
	const client = createClient({
		url: config.url,
		authToken: config.authToken,
	});
	await client.execute("PRAGMA foreign_keys = ON");

	return drizzle(client, { schema });
};
