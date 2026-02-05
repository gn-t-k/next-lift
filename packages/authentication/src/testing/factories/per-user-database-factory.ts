import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { userFactory } from "./user-factory";

export const perUserDatabaseFactory = defineFactory({
	schema,
	table: "perUserDatabase",
	resolver: ({ sequence, use }) => ({
		id: `per-user-db-${sequence}`,
		userId: () =>
			use(userFactory)
				.create()
				.then((u) => u.id),
		databaseName: `next-lift-test-user-${sequence}`,
		databaseUrl: `libsql://next-lift-test-user-${sequence}.turso.io`,
		encryptedToken: `encrypted-token-${sequence}`,
		tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		createdAt: new Date(),
		updatedAt: new Date(),
	}),
});
