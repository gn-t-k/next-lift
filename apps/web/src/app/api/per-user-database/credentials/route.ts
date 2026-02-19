import {
	getValidCredentials,
	UserDatabaseCredentialsNotFoundError,
} from "@next-lift/authentication/user-database-credentials";
import { R } from "@praha/byethrow";
import { headers } from "next/headers";
import { auth } from "../../../../libs/auth";

export const GET = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session == null) {
		return new Response("Unauthorized", { status: 401 });
	}

	const result = await getValidCredentials(session.user.id);

	if (R.isFailure(result)) {
		if (result.error instanceof UserDatabaseCredentialsNotFoundError) {
			return new Response("Not Found", { status: 404 });
		}

		console.error("[Per-User DB Credentials Error]", result.error);
		return new Response("Internal Server Error", { status: 500 });
	}

	return Response.json(
		{
			url: result.value.url,
			authToken: result.value.token,
			expiresAt: result.value.expiresAt.toISOString(),
		},
		{
			headers: {
				"Cache-Control": "no-store",
			},
		},
	);
};
