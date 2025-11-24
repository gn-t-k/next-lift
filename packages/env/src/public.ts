// biome-ignore-all lint/correctness/noProcessGlobal: ブラウザ環境では`node:process`のimportが不可のため、グローバルprocessを使用する
// biome-ignore-all lint/complexity/useLiteralKeys: Next.jsのインライン化のため、ブラケット記法が必須（ドット記法ではTypeScriptエラーが発生）
import { publicRuntimeEnvSchema } from "./schemas";

export const publicEnv = publicRuntimeEnvSchema.parse({
	// Next.jsの`NEXT_PUBLIC_`変数のインライン化を機能させるため、`process.env[変数名]`の形で直接参照する必要がある。`process.env`をそのまま渡すと間接参照となり、インライン化されない
	NEXT_PUBLIC_BETTER_AUTH_URL: process.env["NEXT_PUBLIC_BETTER_AUTH_URL"],
	NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
});
