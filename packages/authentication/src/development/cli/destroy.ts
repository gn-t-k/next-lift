import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import { destroyAuthDatabase } from "../destroy-auth-database";

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
	console.error("Usage: pnpm dev:db:destroy -- --name=<developer-name>");
	process.exit(1);
}

const result = await destroyAuthDatabase(values.name);

if (R.isFailure(result)) {
	console.error("開発用Auth DBの削除に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

console.log(`開発用Auth DB "next-lift-dev-${values.name}-auth" を削除しました`);
