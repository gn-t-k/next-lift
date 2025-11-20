"use server";

import type { AuthenticationError } from "@next-lift/authentication/errors";
import { SessionError } from "@next-lift/authentication/errors";
import { auth } from "@next-lift/authentication/instance";
import { R } from "@praha/byethrow";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { reportAuthenticationError } from "../../../lib/report-authentication-error";

type State = { error: AuthenticationError | null };

export const signOut = async (
	_prevState: State,
	_formData: FormData,
): Promise<{ error: AuthenticationError | null }> => {
	const signOutFn = R.try({
		try: async (): Promise<void> => {
			await auth.api.signOut({
				headers: await headers(),
			});
		},
		catch: (error): SessionError =>
			new SessionError({ operation: "delete", cause: error }),
	});

	const result = await signOutFn();

	if (R.isFailure(result)) {
		reportAuthenticationError(result.error);
		return { error: result.error };
	}

	redirect("/auth/login");
};
