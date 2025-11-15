import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const sentryEnv = () =>
	createEnv({
		server: {
			SENTRY_ORG: z.string().min(1),
			SENTRY_PROJECT: z.string().min(1),
			SENTRY_AUTH_TOKEN: z.string().min(1),
		},
		// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
		runtimeEnv: process.env,
		skipValidation:
			// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
			// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
			!!process.env["CI"] || process.env["npm_lifecycle_event"] === "lint",
		emptyStringAsUndefined: true,
	});
