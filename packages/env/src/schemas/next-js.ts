import z from "zod";
import type { Schemas } from "./type";

export const nextJsEnvSchemas = {
	privateBuild: z.object({
		NEXT_RUNTIME: z.enum(["nodejs", "edge"]),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
