"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { R } from "@praha/byethrow";
import { type FC, useActionState } from "react";
import { signInWithApple } from "../_mutations/sign-in-with-apple";

export const AppleSignInButton: FC = () => {
	const [state, action, pending] = useActionState(signInWithApple, undefined);

	return (
		<form action={action} className="space-y-4">
			{state && R.isFailure(state) && (
				<ErrorAlert>Appleでサインインに失敗しました</ErrorAlert>
			)}
			<Button type="submit" isDisabled={pending}>
				{pending ? "サインイン中..." : "Appleでサインイン"}
			</Button>
		</form>
	);
};
