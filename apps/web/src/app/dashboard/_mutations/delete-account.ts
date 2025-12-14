"use server";

import { auth } from "@next-lift/authentication/instance";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

class DeleteAccountError extends ErrorFactory({
	name: "DeleteAccountError",
	message: "Delete account failed",
}) {}

type State = R.Result<void, DeleteAccountError> | undefined;

export const deleteAccount = async (_prevState: State, _formData: FormData) =>
	R.pipe(
		R.try({
			immediate: true,
			try: async () => {
				await auth.api.deleteUser({
					headers: await headers(),
					body: {},
				});
			},
			catch: (error) => {
				const deleteAccountError = new DeleteAccountError({ cause: error });
				console.error(deleteAccountError);
				Sentry.captureException(deleteAccountError);

				return deleteAccountError;
			},
		}),
		R.inspect(() => {
			redirect("/auth/sign-in");
		}),
	);
