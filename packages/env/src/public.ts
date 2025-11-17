import { createLazyProxy } from "./libs/create-lazy-proxy";
import { publicRuntimeEnvSchema } from "./schemas";

const createPublicEnv = () => {
	// biome-ignore lint/correctness/noProcessGlobal: ブラウザ環境では`node:process`のimportが不可のため、グローバルprocessを使用する
	const processEnv = process.env;
	return publicRuntimeEnvSchema.parse(processEnv);
};

export const publicEnv = createLazyProxy(() => createPublicEnv());
