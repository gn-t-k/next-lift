import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "./get-database";
import * as schema from "./generated/schema";

export const auth = betterAuth({
	database: drizzleAdapter(getDatabase(), {
		provider: "sqlite",
		schema,
	}),
	socialProviders: {
		google: {
			clientId: process.env["GOOGLE_CLIENT_ID"] as string,
			clientSecret: process.env["GOOGLE_CLIENT_SECRET"] as string,
		},
	},
	baseURL: process.env["BETTER_AUTH_URL"] as string,
	secret: process.env["BETTER_AUTH_SECRET"] as string,
});
