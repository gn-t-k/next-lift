import process from "node:process";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./generated/schema";
import { getDatabase } from "./libs/get-database";

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
