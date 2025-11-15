import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const authenticationEnv = () =>
	createEnv({
		server: {
			BETTER_AUTH_SECRET: z.string().min(1),
			BETTER_AUTH_URL: z.url(),
			GOOGLE_CLIENT_ID: z.string().min(1),
			GOOGLE_CLIENT_SECRET: z.string().min(1),
		},
		// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
		runtimeEnv: process.env,
		skipValidation:
			// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
			// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
			!!process.env["SKIP_ENV_VALIDATION"] ||
			// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
			// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
			!!process.env["CI"] ||
			// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
			// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
			process.env["npm_lifecycle_event"] === "lint",
		emptyStringAsUndefined: true,
	});
