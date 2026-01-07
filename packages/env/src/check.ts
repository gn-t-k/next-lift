import process from "node:process";
import { R } from "@praha/byethrow";
import { parsePrivateEnv } from "./private/parse-private-env";
import { parsePublicEnv } from "./public/parse-public-env";

R.pipe(
	R.do(),
	R.andThrough(parsePrivateEnv),
	R.andThrough(parsePublicEnv),
	R.inspect(() => {
		console.log("✅ すべての環境変数が正しく設定されています");
	}),
	R.inspectError((error) => {
		console.error("❌ 環境変数の検証に失敗しました");
		console.error(error);
		process.exit(1);
	}),
);
