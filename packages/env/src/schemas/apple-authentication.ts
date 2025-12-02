import z from "zod";
import type { Schemas } from "./type";

export const appleAuthenticationEnvSchemas = {
	privateBuild: z.object({
		APPLE_CLIENT_ID: z.string().min(1),
		APPLE_TEAM_ID: z.string().length(10),
		APPLE_KEY_ID: z.string().length(10),
		APPLE_PRIVATE_KEY: z.string().min(1),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
