"use client";

import { Button } from "@next-lift/react-components/ui";
import { useActionState } from "react";
import { signOut } from "../_actions/sign-out";

export const SignOutButton = () => {
	const [_state, formAction, isPending] = useActionState(signOut, {
		error: null,
	});

	return (
		<form action={formAction}>
			<Button type="submit" intent="outline" isDisabled={isPending}>
				{isPending ? "ログアウト中..." : "ログアウト"}
			</Button>
		</form>
	);
};
