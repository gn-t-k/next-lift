/** biome-ignore-all lint/complexity/useLiteralKeys: インデックスシグネチャからのプロパティアクセスはブラケット記法が必要 */
/** biome-ignore-all lint/correctness/noProcessGlobal: ブラウザ環境では`node:process`のimportが不可のため、グローバルprocessを使用する */

import { parseEnv } from "../libs/parse-env";
import { publicDynamicEnvSchema, publicStaticEnvSchema } from "../schema";

export const publicEnv = parseEnv({
	staticEnvSchema: publicStaticEnvSchema,
	dynamicEnvSchema: publicDynamicEnvSchema,
	env: {
		// `process.env`をそのまま渡すとインライン化されないため、`process.env[変数名]`の形で直接参照する必要がある。
		NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
	},
	lazy: true,
});
