import { defineConfig } from "drizzle-kit";

// per-user-databaseはユーザーごとに動的に作成されるため、drizzle.config.tsではDB接続情報を指定しない。
// マイグレーションSQLの生成（migration:generate）にはDB接続は不要。
// dialect: "sqlite" + driver: "expo" でSQL + migrations.js（iOS用）を同時生成する。
// TursoはSQLiteベースのため、生成されるSQLはdialect: "turso"と同一。
export default defineConfig({
	out: "./drizzle",
	schema: "./src/database-schemas/index.ts",
	dialect: "sqlite",
	driver: "expo",
});
