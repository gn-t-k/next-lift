import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { createSharedEnvConfig } from "./libs/shared-config";

export const sentryEnv = () =>
	createEnv({
		server: {
			SENTRY_ORG: z.string().min(1),
			SENTRY_PROJECT: z.string().min(1),
			SENTRY_AUTH_TOKEN: z.string().min(1),
		},
		...createSharedEnvConfig(),
	});
