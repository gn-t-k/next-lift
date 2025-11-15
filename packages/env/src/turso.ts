import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { createSharedEnvConfig } from "./libs/shared-config";

export const tursoEnv = () =>
	createEnv({
		server: {
			DATABASE_PROVIDER: z.enum(["local", "turso"]),
			TURSO_AUTH_DATABASE_URL: z.string().min(1),
			TURSO_AUTH_DATABASE_AUTH_TOKEN: z.string().min(1),
		},
		...createSharedEnvConfig(),
	});
