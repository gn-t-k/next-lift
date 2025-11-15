import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { createSharedEnvConfig } from "./libs/shared-config";

export const authenticationEnv = () =>
	createEnv({
		server: {
			BETTER_AUTH_SECRET: z.string().min(1),
			BETTER_AUTH_URL: z.url(),
			GOOGLE_CLIENT_ID: z.string().min(1),
			GOOGLE_CLIENT_SECRET: z.string().min(1),
		},
		...createSharedEnvConfig(),
	});
