"use client";

import { Button, ErrorAlert } from "@next-lift/react-components/ui";
import { R } from "@praha/byethrow";
import { type FC, use, useActionState } from "react";
import { signInWithGoogle } from "../_mutations/sign-in-with-google";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
	searchParams?: SearchParams;
};

export const GoogleSignInButton: FC<Props> = ({ searchParams }) => {
	const [state, action, pending] = useActionState(signInWithGoogle, undefined);
	const searchParamsErrors = searchParams
		? getSearchParamsErrors(searchParams)
		: [];

	return (
		<form action={action} className="space-y-4">
			{state && R.isFailure(state) && (
				<ErrorAlert>Googleでサインインに失敗しました</ErrorAlert>
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
				{pending ? "サインイン中..." : "Googleでサインイン"}
			</Button>
		</form>
	);
};

export const GoogleSignInButtonSkeleton: FC = () => {
	return <Button isDisabled>Googleでサインイン</Button>;
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
			return "Googleアカウントでのサインインがキャンセルされました。";
		default:
			return "サインインに失敗しました。";
	}
};
