import process from "node:process";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { parseEnv } from "./parse-env";
import {
	privateDynamicEnvSchema,
	privateStaticEnvSchema,
	publicDynamicEnvSchema,
	publicStaticEnvSchema,
} from "./schema";

class ParsePrivateEnvError extends ErrorFactory({
	name: "ParsePrivateEnvError",
	message: "private環境変数のパースに失敗しました",
}) {}
const parsePrivateEnv = R.try({
	try: () => {
		parseEnv({
			staticEnvSchema: privateStaticEnvSchema,
			dynamicEnvSchema: privateDynamicEnvSchema,
			env: process.env,
		});
	},
	catch: (error) => {
		return new ParsePrivateEnvError({ cause: error });
	},
});

class ParsePublicEnvError extends ErrorFactory({
	name: "ParsePublicEnvError",
	message: "public環境変数のパースに失敗しました",
}) {}
const parsePublicEnv = R.try({
	try: () => {
		parseEnv({
			staticEnvSchema: publicStaticEnvSchema,
			dynamicEnvSchema: publicDynamicEnvSchema,
			env: process.env,
		});
	},
	catch: (error) => {
		return new ParsePublicEnvError({ cause: error });
	},
});

R.pipe(
	R.do(),
	R.andThrough(parsePrivateEnv),
	R.andThrough(parsePublicEnv),
	R.inspect(() => {
		console.log("✅ すべての環境変数が正しく設定されています");
	}),
	R.inspectError((error) => {
		console.error("❌ 環境変数の検証に失敗しました");
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}),
);
