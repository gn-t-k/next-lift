import process from "node:process";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { parseEnv } from "../../helpers/parse-env";
import { publicDynamicEnvSchema, publicStaticEnvSchema } from "../../schemas";

export class ParsePublicEnvError extends ErrorFactory({
	name: "ParsePublicEnvError",
	message: "public環境変数のパースに失敗しました",
}) {}

export const parsePublicEnv = R.try({
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
