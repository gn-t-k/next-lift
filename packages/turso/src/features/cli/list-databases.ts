import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import { listDatabases } from "../list-databases/list-databases";

const { values } = parseArgs({
	options: {
		prefix: {
			type: "string",
			short: "p",
		},
		exclude: {
			type: "string",
			short: "e",
		},
	},
});

const result = await listDatabases();

if (R.isFailure(result)) {
	console.error("データベース一覧の取得に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

let databases = result.value;

// prefixでフィルタリング
if (values.prefix) {
	const prefix = values.prefix;
	databases = databases.filter((db) => db.name.startsWith(prefix));
}

// excludeで除外
if (values.exclude) {
	databases = databases.filter((db) => db.name !== values.exclude);
}

// 名前のみを出力（シェルスクリプトで使いやすいように）
for (const db of databases) {
	console.log(db.name);
}
