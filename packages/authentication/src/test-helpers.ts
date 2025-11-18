import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getTestDatabase } from "./libs/get-database";

export const createTestAuth = async () => {
	const db = getTestDatabase();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
		}),
		secret: "test-secret",
		emailAndPassword: {
			enabled: true,
		},
		rateLimit: {
			enabled: false,
		},
		advanced: {
			disableCSRFCheck: true,
		},
	});
};
