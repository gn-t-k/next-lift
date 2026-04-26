import { generateId } from "@next-lift/utilities/generate-id";
import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { userFactory } from "./user-factory";

export const sessionFactory = defineFactory({
	schema,
	table: "session",
	resolver: ({ sequence, use }) => ({
		id: generateId(),
		userId: () =>
			use(userFactory)
				.create()
				.then((u) => u.id),
		token: `session-token-${sequence}`,
		expiresAt: new Date(Date.now() + 86400000),
		ipAddress: null,
		userAgent: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	}),
});
