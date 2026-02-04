import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import { createAuthDatabase } from "../create-auth-database";

// pnpm run経由で`--`が渡される場合に対応
const rawArgs = process.argv.slice(2);
const { values } = parseArgs({
	args: rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs,
	options: {
		name: {
			type: "string",
			short: "n",
		},
	},
});

if (!values.name) {
	console.error("Error: --name フラグは必須です");
	console.error("Usage: pnpm dev:db:create -- --name=<developer-name>");
	process.exit(1);
}

const result = await createAuthDatabase(values.name);

if (R.isFailure(result)) {
	console.error("開発用Auth DBの作成に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

const db = result.value;
console.log("開発用Auth DBを作成しました:");
console.log(`  Database: ${db.databaseName}`);
console.log(`  URL: ${db.url}`);
console.log("");
console.log("以下をルートの .env に設定してください:");
console.log(`  TURSO_AUTH_DATABASE_URL=${db.url}`);
console.log(`  TURSO_AUTH_DATABASE_AUTH_TOKEN=${db.authToken}`);
