"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { R } from "@praha/byethrow";
import { type FC, use, useActionState } from "react";
import { signInWithApple } from "../_mutations/sign-in-with-apple";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
	searchParams?: SearchParams;
};

export const AppleSignInButton: FC<Props> = ({ searchParams }) => {
	const [state, action, pending] = useActionState(signInWithApple, undefined);
	const searchParamsErrors = searchParams
		? getSearchParamsErrors(searchParams)
		: [];

	return (
		<form action={action} className="space-y-4">
			{state && R.isFailure(state) && (
				<ErrorAlert>Appleでサインインに失敗しました</ErrorAlert>
			)}
			{searchParamsErrors.length > 0 && (
				<ul>
					{searchParamsErrors.map((error) => (
						<li key={error}>
							<ErrorAlert>{formatSearchParamsError(error)}</ErrorAlert>
						</li>
					))}
				</ul>
			)}
			<Button type="submit" isDisabled={pending}>
				{pending ? "サインイン中..." : "Appleでサインイン"}
			</Button>
		</form>
	);
};

export const AppleSignInButtonSkeleton: FC = () => {
	return <Button isDisabled>Appleでサインイン</Button>;
};

const getSearchParamsErrors = (searchParams: SearchParams): string[] => {
	// biome-ignore lint/complexity/useLiteralKeys: index signatureへのアクセスにはブラケット記法が必要
	const error = use(searchParams)["error"];
	const errors =
		error === undefined ? [] : Array.isArray(error) ? error : [error];

	return [...new Set(errors)];
};

const formatSearchParamsError = (error: string): string => {
	switch (error) {
		case "access_denied":
			return "Appleアカウントでのサインインがキャンセルされました。";
		default:
			return "サインインに失敗しました。";
	}
};
