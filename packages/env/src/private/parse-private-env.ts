import process from "node:process";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { parseEnv } from "../libs/parse-env";
import { privateDynamicEnvSchema, privateStaticEnvSchema } from "../schema";

export class ParsePrivateEnvError extends ErrorFactory({
	name: "ParsePrivateEnvError",
	message: "private環境変数のパースに失敗しました",
}) {}

export const parsePrivateEnv = R.try({
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
