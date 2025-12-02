"use server";

import { auth } from "@next-lift/authentication/instance";
import { publicEnv } from "@next-lift/env/public";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import * as Sentry from "@sentry/nextjs";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

class SignInWithAppleError extends ErrorFactory({
	name: "SignInWithAppleError",
	message: "Sign in with Apple failed",
}) {}

type State = R.Result<string, SignInWithAppleError> | undefined;

export const signInWithApple = async (_prevState: State, _formData: FormData) =>
	R.pipe(
		R.try({
			immediate: true,
			try: async () => {
				const { url } = await auth.api.signInSocial({
					headers: await headers(),
					body: {
						provider: "apple",
						callbackURL: "/dashboard",
						errorCallbackURL: `${publicEnv.NEXT_PUBLIC_BETTER_AUTH_URL}/auth/sign-in`,
					},
				});

				if (!url) {
					throw new Error("認証URLの取得に失敗しました");
				}

				return url;
			},
			catch: (error) => {
				const signInError = new SignInWithAppleError({ cause: error });
				Sentry.captureException(signInError);

				return signInError;
			},
		}),
		R.inspect((url) => {
			redirect(url as Route);
		}),
	);
