/** biome-ignore-all lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可のため、グローバルprocessを使用する */

import { parseEnv } from "../libs/parse-env";
import { privateDynamicEnvSchema, privateStaticEnvSchema } from "../schema";

// Node.js環境で.envファイルが存在する場合、自動的に読み込む
// Edge Runtime: process.loadEnvFileが存在しないためスキップ
// CI/Vercel: .envファイルが存在しないため、catchでスキップ
// Next.js: 既にNext.jsが.envを読み込んでいるため、再設定されるが影響なし
if (typeof process.loadEnvFile === "function") {
	try {
		process.loadEnvFile();
	} catch {
		// .envファイルが存在しない環境ではスキップ
	}
}

export const env = parseEnv({
	staticEnvSchema: privateStaticEnvSchema,
	dynamicEnvSchema: privateDynamicEnvSchema,
	env: process.env,
	lazy: true,
});
