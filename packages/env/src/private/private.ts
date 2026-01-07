import { parseEnv } from "../libs/parse-env";
import { privateDynamicEnvSchema, privateStaticEnvSchema } from "../schema";

export const env = parseEnv({
	staticEnvSchema: privateStaticEnvSchema,
	dynamicEnvSchema: privateDynamicEnvSchema,
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可
	env: process.env,
	lazy: true,
});
