import { createClient } from "@libsql/client";
import { env } from "@next-lift/env/private";
import { drizzle } from "drizzle-orm/libsql";

export const getDatabase = () => {
	const url = env.TURSO_AUTH_DATABASE_URL;
	const authToken = env.TURSO_AUTH_DATABASE_AUTH_TOKEN;
	const nodeEnv = env.NODE_ENV;

	if (nodeEnv === "production" && !url.startsWith("libsql://")) {
		throw new Error(
			"本番の実行環境にローカルDBを作成してしまうことを防ぐため、ビルド環境ではTURSO_AUTH_DATABASE_URLにリモートURLを指定してください",
		);
	}

	return drizzle({
		client: createClient(
			authToken === undefined ? { url } : { url, authToken },
		),
	});
};

export const getTestDatabase = () => {
	return drizzle({ client: createClient({ url: ":memory:" }) });
};
