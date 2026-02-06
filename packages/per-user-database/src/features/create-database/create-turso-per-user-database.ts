import { createHash } from "node:crypto";
import { env } from "@next-lift/env/private";
import { createDatabase } from "@next-lift/turso/create-database";
import { issueToken } from "@next-lift/turso/issue-token";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";

const TOKEN_EXPIRATION_DAYS = 30;

export class CreateTursoPerUserDatabaseError extends ErrorFactory({
	name: "CreateTursoPerUserDatabaseError",
	message: "Per-User Databaseの作成中にエラーが発生しました。",
}) {}

export const createTursoPerUserDatabase = (
	userId: string,
	now: Date = new Date(),
): R.ResultAsync<
	{
		name: string;
		url: string;
		authToken: string;
		expiresAt: Date;
	},
	CreateTursoPerUserDatabaseError
> => {
	return R.pipe(
		R.do(),
		R.bind("createdDatabase", () =>
			createDatabase(generatePerUserDatabaseName(userId)),
		),
		R.bind("issuedToken", ({ createdDatabase }) =>
			issueToken({
				databaseName: createdDatabase.name,
				expiresInDays: TOKEN_EXPIRATION_DAYS,
				startingFrom: now,
			}),
		),
		R.map(({ createdDatabase, issuedToken }) => ({
			name: createdDatabase.name,
			url: `libsql://${createdDatabase.hostname}`,
			authToken: issuedToken.jwt,
			expiresAt: issuedToken.expiresAt,
		})),
		R.mapError(
			(error) => new CreateTursoPerUserDatabaseError({ cause: error }),
		),
	);
};

const generatePerUserDatabaseName = (userId: string) => {
	// Turso DB名は小文字・数字・ハイフンのみ許可、最大56文字
	const normalizedUserId = userId.toLowerCase().replaceAll("_", "-");
	const hashedUserId = createHash("sha256")
		.update(normalizedUserId)
		.digest("hex")
		.slice(0, 16);

	return `next-lift-${env.APP_ENV}-user-${hashedUserId}`;
};
