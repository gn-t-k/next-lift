import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";

export const createTestAuth = async () => {
	const db = drizzle({ client: createClient({ url: ":memory:" }) });

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
