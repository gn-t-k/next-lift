import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDatabase } from "./get-database";

export const auth = betterAuth({
	database: drizzleAdapter(getDatabase(), {
		provider: "sqlite",
	}),
});
