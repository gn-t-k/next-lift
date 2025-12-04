// biome-ignore-all lint/correctness/noProcessGlobal: drizzle-kitはCLIツールとして実行されるため、node:processをimportせずprocess.envを直接参照する
// biome-ignore-all lint/complexity/useLiteralKeys: インデックスシグネチャの型ではドット記法が許可されていないため
import { defineConfig } from "drizzle-kit";

// drizzle-kitはCLIツールとして実行されるため、@next-lift/env/privateを使用すると
// 全環境変数のバリデーションが走り、DB接続に不要な環境変数まで要求される。
// CI/CDでマイグレーションのみ実行する場合に問題となるため、process.envを直接参照する。
const url = process.env["TURSO_AUTH_DATABASE_URL"];
const authToken = process.env["TURSO_AUTH_DATABASE_AUTH_TOKEN"];

const dbCredentials =
	url && authToken ? { url, authToken } : { url: "file:development-auth.db" };

export default defineConfig({
	out: "./drizzle",
	schema: "./src/generated/schema.ts",
	dialect: "turso",
	dbCredentials,
});
