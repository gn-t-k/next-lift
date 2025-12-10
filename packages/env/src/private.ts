import { parseEnv } from "./parse-env";
import { privateDynamicEnvSchema, privateStaticEnvSchema } from "./schema";

/**
 * private環境変数
 *
 * 秘匿すべき環境変数。サーバーサイドでのみ使用可能。
 * - ビルド時必須の環境変数は即座に検証
 * - デプロイ時必須の環境変数は遅延評価（プロパティアクセス時に検証）
 */
export const env = parseEnv({
	staticEnvSchema: privateStaticEnvSchema,
	dynamicEnvSchema: privateDynamicEnvSchema,
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可
	env: process.env,
	lazy: true,
});
