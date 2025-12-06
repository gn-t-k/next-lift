import z from "zod";
import type { Schemas } from "./type";

export const betterAuthEnvSchemas = {
	privateBuild: z.object({
		BETTER_AUTH_URL: z.url(),
		BETTER_AUTH_SECRET: z.string().min(1),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
