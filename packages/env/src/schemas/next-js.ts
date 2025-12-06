import z from "zod";
import type { Schemas } from "./type";

export const nextJsEnvSchemas = {
	privateBuild: z.object({}),
	privateRuntime: z.object({
		// Next.jsがランタイム時に設定する環境変数（ビルド時には存在しない）
		NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
	}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
