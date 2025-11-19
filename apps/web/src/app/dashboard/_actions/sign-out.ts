"use server";

import { SessionError } from "@next-lift/authentication/errors";
import { auth } from "@next-lift/authentication/instance";
import { Result } from "@praha/byethrow";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { reportAuthenticationError } from "../../../lib/report-authentication-error";

export const signOut = async (
	_prevState: unknown,
	_formData: FormData,
): Promise<void> => {
	const signOutFn = Result.try({
		try: async (): Promise<void> => {
			await auth.api.signOut({
				headers: await headers(),
			});
		},
		catch: (error): SessionError =>
			new SessionError({ operation: "delete", cause: error }),
	});

	const result = await signOutFn();

	if (Result.isFailure(result)) {
		reportAuthenticationError(result.error);
		// エラー時はthrowしてクライアント側でキャッチできるようにする
		throw result.error;
	}

	// 成功時はログインページにリダイレクト
	redirect("/auth/login");
};
