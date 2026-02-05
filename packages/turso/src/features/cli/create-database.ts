import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import { createDatabase } from "../create-database/create-database";

const { values } = parseArgs({
	options: {
		name: {
			type: "string",
			short: "n",
		},
	},
});

if (!values.name) {
	console.error("Error: --name フラグは必須です");
	console.error("Usage: pnpm db:create --name=<database-name>");
	process.exit(1);
}

const result = await createDatabase(values.name);

if (R.isFailure(result)) {
	console.error("データベースの作成に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

const database = result.value;
console.log("データベースを作成しました:");
console.log(`  Name: ${database.name}`);
console.log(`  ID: ${database.id}`);
console.log(`  Hostname: ${database.hostname}`);
