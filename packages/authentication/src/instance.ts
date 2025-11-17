import { env } from "@next-lift/env/private";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./generated/schema";
import { createLazyProxy } from "./libs/create-lazy-proxy";
import { getDatabase } from "./libs/get-database";

export const auth = createLazyProxy(() => {
	const envVars = env();

	return betterAuth({
		database: drizzleAdapter(getDatabase(), {
			provider: "sqlite",
			schema,
		}),
		socialProviders: {
			google: {
				clientId: envVars.GOOGLE_CLIENT_ID,
				clientSecret: envVars.GOOGLE_CLIENT_SECRET,
			},
		},
		baseURL: envVars.BETTER_AUTH_URL,
		secret: envVars.BETTER_AUTH_SECRET,
	});
});
