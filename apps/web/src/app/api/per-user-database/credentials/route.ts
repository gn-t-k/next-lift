import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "../../../../libs/auth";
import { getCredentialsResponse } from "./_queries/get-credentials-response";

export const GET = async () => {
	await connection();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session == null) {
		return new Response("Unauthorized", { status: 401 });
	}

	return getCredentialsResponse(session.user.id);
};
