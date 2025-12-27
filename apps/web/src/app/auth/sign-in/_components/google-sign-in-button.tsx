"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { R } from "@praha/byethrow";
import { type FC, useActionState } from "react";
import { signInWithGoogle } from "../_mutations/sign-in-with-google";

export const GoogleSignInButton: FC = () => {
	const [state, action, pending] = useActionState(signInWithGoogle, undefined);

	return (
		<form action={action} className="space-y-4">
			{state && R.isFailure(state) && (
				<ErrorAlert>Googleでサインインに失敗しました</ErrorAlert>
			)}
			<Button type="submit" isDisabled={pending}>
				{pending ? "サインイン中..." : "Googleでサインイン"}
			</Button>
		</form>
	);
};
