import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import {
	DatabaseNotFoundError,
	deleteDatabase,
} from "../delete-database/delete-database";

const PREVIEW_DB_PATTERN = /^next-lift-preview-pr\d+-/;

const { values } = parseArgs({
	options: {
		name: {
			type: "string",
			short: "n",
		},
		force: {
			type: "boolean",
			short: "f",
			default: false,
		},
	},
});

if (!values.name) {
	console.error("Error: --name フラグは必須です");
	console.error("Usage: pnpm db:delete --name=<database-name>");
	process.exit(1);
}

const isPreviewDatabase = PREVIEW_DB_PATTERN.test(values.name);
if (!(isPreviewDatabase || values.force)) {
	console.error(
		`Error: "${values.name}" はプレビュー用データベースではありません。`,
	);
	console.error(
		"本番データベースの誤削除を防ぐため、プレビュー用DB以外の削除には --force フラグが必要です。",
	);
	console.error("Usage: pnpm db:delete --name=<database-name> --force");
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
