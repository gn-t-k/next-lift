"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { useActionState } from "react";
import { formatAuthenticationError } from "../../../lib/format-authentication-error";
import { signOut } from "../_actions/sign-out";

export const SignOutButton = () => {
	const [state, formAction, isPending] = useActionState(signOut, {
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
				<Button type="submit" intent="outline" isDisabled={isPending}>
					{isPending ? "ログアウト中..." : "ログアウト"}
				</Button>
			</form>
		</div>
	);
};
