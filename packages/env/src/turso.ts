import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const tursoEnv = () =>
	createEnv({
		server: {
			DATABASE_PROVIDER: z.enum(["local", "turso"]),
			TURSO_AUTH_DATABASE_URL: z.string().min(1),
			TURSO_AUTH_DATABASE_AUTH_TOKEN: z.string().min(1),
		},
		// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
		runtimeEnv: process.env,
		skipValidation:
			// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
			// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
			process.env["npm_lifecycle_event"] === "lint",
		emptyStringAsUndefined: true,
	});
