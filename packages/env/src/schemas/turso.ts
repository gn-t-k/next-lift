import z from "zod";
import type { Schemas } from "./type";

// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可のため、グローバルprocessを使用する
// biome-ignore lint/complexity/useLiteralKeys: process.envの型定義の制約によりドット記法が使えない
const isProduction = process.env["NODE_ENV"] === "production";

export const tursoEnvSchemas = {
	privateBuild: z.object({
		TURSO_AUTH_DATABASE_URL: isProduction ? z.url() : z.string().optional(),
		TURSO_AUTH_DATABASE_AUTH_TOKEN: isProduction
			? z.string().min(1)
			: z.string().min(1).optional(),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
