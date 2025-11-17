import z from "zod";
import type { Schemas } from "./type";

export const sentryEnvSchemas = {
	privateBuild: z.object({
		SENTRY_ORG: z.string().min(1),
		SENTRY_PROJECT: z.string().min(1),
		SENTRY_AUTH_TOKEN: z.string().min(1),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({
		NEXT_PUBLIC_SENTRY_DSN: z.url(),
	}),
} as const satisfies Schemas;
