// src/type.ts
import type { z } from "zod";

export type Schemas<
	TBuild extends z.ZodRawShape = z.ZodRawShape,
	TRuntime extends z.ZodRawShape = z.ZodRawShape,
	TPublic extends z.ZodRawShape = z.ZodRawShape,
> = {
	privateBuild: z.ZodObject<TBuild>;
	privateRuntime: z.ZodObject<TRuntime>;
	publicRuntime: z.ZodObject<TPublic>;
};
