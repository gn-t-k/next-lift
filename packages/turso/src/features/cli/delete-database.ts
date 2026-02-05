// biome-ignore-all lint/complexity/useLiteralKeys: インデックスシグネチャの型ではドット記法が許可されていないため
import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import { deleteDatabase } from "../delete-database/delete-database";

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
	console.error("Usage: pnpm db:delete --name=<database-name>");
	process.exit(1);
}

const credentials = {
	apiToken: process.env["TURSO_PLATFORM_API_TOKEN"] ?? "",
	organization: process.env["TURSO_ORGANIZATION"] ?? "",
};

const result = await deleteDatabase(values.name, credentials);

if (R.isFailure(result)) {
	console.error("データベースの削除に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

console.log(`データベース "${values.name}" を削除しました`);
