import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";

export class IssueTokenError extends ErrorFactory({
	name: "IssueTokenError",
	message: "トークンの発行中にエラーが発生しました。",
}) {}

export function issueToken(params: {
	expiresInDays: null;
	databaseName: string;
}): R.ResultAsync<{ jwt: string; expiresAt: null }, IssueTokenError>;
export function issueToken(params: {
	expiresInDays: number;
	startingFrom: Date;
	databaseName: string;
}): R.ResultAsync<{ jwt: string; expiresAt: Date }, IssueTokenError>;

export function issueToken(
	params:
		| { expiresInDays: null; databaseName: string }
		| { expiresInDays: number; startingFrom: Date; databaseName: string },
): R.ResultAsync<
	{ jwt: string; expiresAt: null } | { jwt: string; expiresAt: Date },
	IssueTokenError
> {
	return R.try({
		immediate: true,
		try: async () => {
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const response =
				params.expiresInDays === null
					? await fetch(
							`https://api.turso.tech/v1/organizations/${organization}/databases/${params.databaseName}/auth/tokens`,
							{
								method: "POST",
								headers: {
									Authorization: `Bearer ${apiToken}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									expiration: "never",
									authorization: "full-access",
								}),
							},
						)
					: await fetch(
							`https://api.turso.tech/v1/organizations/${organization}/databases/${params.databaseName}/auth/tokens?expiration=${params.expiresInDays}d`,
							{
								method: "POST",
								headers: {
									Authorization: `Bearer ${apiToken}`,
								},
							},
						);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`トークンの作成に失敗しました: ${response.status} ${response.statusText} - ${errorText}`,
				);
			}

			const data = z
				.object({
					jwt: z.string(),
				})
				.parse(await response.json());

			if (params.expiresInDays === null) {
				return { jwt: data.jwt, expiresAt: null };
			}

			const expiresAt = new Date(params.startingFrom);
			expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);

			return { jwt: data.jwt, expiresAt };
		},
		catch: (error) => new IssueTokenError({ cause: error }),
	});
}
