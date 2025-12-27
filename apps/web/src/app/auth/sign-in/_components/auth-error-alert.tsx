import { ErrorAlert } from "@next-lift/react-components/ui";
import type { FC } from "react";

type Props = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const AuthErrorAlert: FC<Props> = async ({ searchParams }) => {
	const errors = await getSearchParamsErrors(searchParams);

	if (errors.length === 0) {
		return null;
	}

	return (
		<ul className="space-y-2">
			{errors.map((error) => (
				<li key={error}>
					<ErrorAlert>{formatSearchParamsError(error)}</ErrorAlert>
				</li>
			))}
		</ul>
	);
};

const getSearchParamsErrors = async (
	searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<string[]> => {
	// biome-ignore lint/complexity/useLiteralKeys: index signatureへのアクセスにはブラケット記法が必要
	const error = (await searchParams)["error"];
	const errors =
		error === undefined ? [] : Array.isArray(error) ? error : [error];

	return [...new Set(errors)];
};

const formatSearchParamsError = (error: string): string => {
	switch (error) {
		case "access_denied":
			return "サインインがキャンセルされました。";
		default:
			return "サインインに失敗しました。もう一度お試しください。";
	}
};
