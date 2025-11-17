import z from "zod";
import type { Schemas } from "./type";

export const googleAuthenticationEnvSchemas = {
	privateBuild: z.object({
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
