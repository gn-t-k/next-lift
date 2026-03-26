import { env } from "@next-lift/env/private";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";
import { z } from "zod";
import { getFetch } from "../../helpers/fetch-context";

export class IssueTokenError extends ErrorFactory({
	name: "IssueTokenError",
	message: "トークンの発行中にエラーが発生しました。",
}) {}

export const issueToken = (
	params:
		| { expiresInDays: null; databaseName: string }
		| { expiresInDays: number; startingFrom: Date; databaseName: string },
): R.ResultAsync<
	{ jwt: string; expiresAt: null } | { jwt: string; expiresAt: Date },
	IssueTokenError
> =>
	R.try({
		immediate: true,
		try: async () => {
			const fetchFn = getFetch();
			const apiToken = env.TURSO_PLATFORM_API_TOKEN;
			const organization = env.TURSO_ORGANIZATION;

			const hasExpiration = params.expiresInDays !== null;

			const response = hasExpiration
				? await fetchFn(
						`https://api.turso.tech/v1/organizations/${organization}/databases/${params.databaseName}/auth/tokens?expiration=${params.expiresInDays}d`,
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${apiToken}`,
							},
						},
					)
				: await fetchFn(
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

			if (!hasExpiration) {
				return { jwt: data.jwt, expiresAt: null };
			}

			const expiresAt = new Date(params.startingFrom);
			expiresAt.setDate(expiresAt.getDate() + params.expiresInDays);

			return { jwt: data.jwt, expiresAt };
		},
		catch: (error) => new IssueTokenError({ cause: error }),
	});
