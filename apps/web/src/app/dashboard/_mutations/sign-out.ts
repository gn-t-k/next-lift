"use server";

import { auth } from "@next-lift/authentication/instance";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

class SignOutError extends ErrorFactory({
	name: "SignOutError",
	message: "Sign out failed",
}) {}

type State = R.Result<void, SignOutError> | undefined;

export const signOut = async (_prevState: State, _formData: FormData) =>
	R.pipe(
		R.try({
			immediate: true,
			try: async () => {
				await auth.api.signOut({
					headers: await headers(),
				});
			},
			catch: (error) => {
				return new SignOutError({ cause: error });
			},
		}),
		R.inspect(() => {
			redirect("/auth/sign-in");
		}),
	);
