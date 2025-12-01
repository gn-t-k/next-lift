"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { R } from "@praha/byethrow";
import { type FC, useActionState } from "react";
import { signOut } from "../_mutations/sign-out";

export const SignOutButton: FC = () => {
	const [state, formAction, isPending] = useActionState(signOut, undefined);

	return (
		<form action={formAction}>
			{state && R.isFailure(state) && (
				<ErrorAlert>サインアウトに失敗しました</ErrorAlert>
			)}
			<Button type="submit" intent="outline" isDisabled={isPending}>
				{isPending ? "サインアウト中..." : "サインアウト"}
			</Button>
		</form>
	);
};
