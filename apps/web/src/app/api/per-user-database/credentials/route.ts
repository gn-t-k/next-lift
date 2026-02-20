import { UserDatabaseCredentialsNotFoundError } from "@next-lift/authentication/user-database-credentials";
import { R } from "@praha/byethrow";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "../../../../libs/auth";
import { getCredentials } from "./_queries/get-credentials";

export const GET = async () => {
	await connection();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session == null) {
		return new Response("Unauthorized", { status: 401 });
	}

	const result = await getCredentials(session.user.id);

	if (R.isFailure(result)) {
		if (result.error instanceof UserDatabaseCredentialsNotFoundError) {
			return new Response("Not Found", { status: 404 });
		}

		console.error("[Per-User DB Credentials Error]", result.error);
		return new Response("Internal Server Error", { status: 500 });
	}

	return Response.json(result.value, {
		headers: {
			"Cache-Control": "no-store",
		},
	});
};
