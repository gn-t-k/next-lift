import { defineFactory } from "@praha/drizzle-factory";
import { schema } from "../../database-schemas";
import { userFactory } from "./user-factory";

export const accountFactory = defineFactory({
	schema,
	table: "account",
	resolver: ({ sequence, use }) => ({
		id: `account-${sequence}`,
		userId: () =>
			use(userFactory)
				.create()
				.then((u) => u.id),
		accountId: `provider-account-id-${sequence}`,
		providerId: "google",
		accessToken: null,
		refreshToken: null,
		idToken: null,
		accessTokenExpiresAt: null,
		refreshTokenExpiresAt: null,
		scope: null,
		password: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	}),
	traits: {
		github: ({ sequence, use }) => ({
			id: `account-${sequence}`,
			userId: () =>
				use(userFactory)
					.create()
					.then((u) => u.id),
			accountId: `provider-account-id-${sequence}`,
			providerId: "github",
			accessToken: null,
			refreshToken: null,
			idToken: null,
			accessTokenExpiresAt: null,
			refreshTokenExpiresAt: null,
			scope: null,
			password: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		}),
	},
});
