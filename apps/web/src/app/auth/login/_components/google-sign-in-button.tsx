"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { useActionState } from "react";
import { formatAuthenticationError } from "../../../../lib/format-authentication-error";
import { signInWithGoogle } from "../_actions/sign-in-with-google";

export const GoogleSignInButton = () => {
	const [state, formAction, isPending] = useActionState(signInWithGoogle, {
		error: null,
	});

	return (
		<div>
			{state.error && (
				<ErrorAlert
					message={formatAuthenticationError(state.error)}
					className="mb-4"
				/>
			)}
			<form action={formAction}>
				<Button type="submit" isDisabled={isPending}>
					{isPending ? "ログイン中..." : "Googleでログイン"}
				</Button>
			</form>
		</div>
	);
};
