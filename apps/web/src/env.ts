import { authenticationEnv, sentryEnv, tursoEnv } from "@next-lift/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	extends: [tursoEnv(), authenticationEnv(), sentryEnv()],
	server: {},
	client: {
		NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
		NEXT_PUBLIC_SENTRY_DSN: z.url(),
	},
	experimental__runtimeEnv: {
		// biome-ignore lint/correctness/noProcessGlobal: Next.jsのビルド時に評価され、実際の値がバンドルに埋め込まれる
		// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
		NEXT_PUBLIC_BETTER_AUTH_URL: process.env["NEXT_PUBLIC_BETTER_AUTH_URL"],
		// biome-ignore lint/correctness/noProcessGlobal: Next.jsのビルド時に評価され、実際の値がバンドルに埋め込まれる
		// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
		NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
	},
	skipValidation:
		// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
		// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
		!!process.env["CI"] || process.env["npm_lifecycle_event"] === "lint",
});
