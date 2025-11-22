"use server";

import type { AuthenticationError } from "@next-lift/authentication/errors";
import {
	NetworkError,
	OAuthProviderError,
} from "@next-lift/authentication/errors";
import { auth } from "@next-lift/authentication/instance";
import { R } from "@praha/byethrow";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { reportAuthenticationError } from "../../../../lib/report-authentication-error";

type State = { error: AuthenticationError | null };

export const signInWithGoogle = async (
	_prevState: State,
	_formData: FormData,
): Promise<{ error: AuthenticationError | null }> => {
	const signInFn = R.try({
		try: async (): Promise<void> => {
			await auth.api.signInSocial({
				body: {
					provider: "google",
				},
				headers: await headers(),
			});
		},
		catch: (error): OAuthProviderError | NetworkError => {
			// Better Authのエラーを分類
			if (error instanceof Error && error.message.includes("network")) {
				return new NetworkError({ cause: error });
			}
			const errorMessage = error instanceof Error ? error.message : undefined;
			return new OAuthProviderError({
				provider: "google",
				...(errorMessage && { code: errorMessage }),
				cause: error,
			});
		},
	});

	const result = await signInFn();

	if (R.isFailure(result)) {
		reportAuthenticationError(result.error);
		return { error: result.error };
	}

	redirect("/dashboard");
};
