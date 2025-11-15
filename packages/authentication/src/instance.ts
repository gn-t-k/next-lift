import { authenticationEnv } from "@next-lift/env/authentication";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./generated/schema";
import { getDatabase } from "./libs/get-database";

const env = authenticationEnv();

export const auth = betterAuth({
	database: drizzleAdapter(getDatabase(), {
		provider: "sqlite",
		schema,
	}),
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
});
