import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import {
	DatabaseNotFoundError,
	deleteDatabase,
} from "../delete-database/delete-database";

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

const result = await deleteDatabase(values.name);

if (R.isFailure(result)) {
	// 404の場合は成功扱い（既に削除済みまたは存在しない）
	if (result.error instanceof DatabaseNotFoundError) {
		console.log(
			`Database "${values.name}" was already deleted or does not exist.`,
		);
		process.exit(0);
	}

	console.error("データベースの削除に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

console.log(`データベース "${values.name}" を削除しました`);
