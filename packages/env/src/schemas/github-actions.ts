import z from "zod";
import type { Schemas } from "./type";

export const githubActionsEnvSchemas = {
	privateBuild: z.object({
		CI: z.enum(["true"]).optional(),
	}),
	privateRuntime: z.object({}),
	publicRuntime: z.object({}),
} as const satisfies Schemas;
