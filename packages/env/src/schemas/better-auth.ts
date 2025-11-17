import z from "zod";
import type { Schemas } from "./type";

export const betterAuthEnvSchemas = {
	privateBuild: z.object({
		BETTER_AUTH_URL: z.url(),
		BETTER_AUTH_SECRET: z.string().min(1),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({
		NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
	}),
} as const satisfies Schemas;
