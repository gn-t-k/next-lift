import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";

export const userFactory = defineFactory({
	schema,
	table: "user",
	resolver: ({ sequence }) => ({
		id: `user-${sequence}`,
		name: `Test User ${sequence}`,
		email: `user${sequence}@example.com`,
		emailVerified: false,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	}),
	traits: {
		verified: ({ sequence }) => ({
			id: `user-${sequence}`,
			name: `Test User ${sequence}`,
			email: `user${sequence}@example.com`,
			emailVerified: true,
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		}),
	},
});
