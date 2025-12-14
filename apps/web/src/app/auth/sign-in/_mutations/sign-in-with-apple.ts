"use server";

import { auth } from "@next-lift/authentication/instance";
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
						// 相対パスを使用することで、プレビュー環境でも動的なURLに対応できる
						// Better Authがheadersからオリジンを取得して絶対URLに変換する
						errorCallbackURL: "/auth/sign-in",
					},
				});

				if (!url) {
					throw new Error("認証URLの取得に失敗しました");
				}

				return url;
			},
			catch: (error) => {
				const signInError = new SignInWithAppleError({ cause: error });
				console.error(signInError);
				Sentry.captureException(signInError);

				return signInError;
			},
		}),
		R.inspect((url) => {
			redirect(url as Route);
		}),
	);
