import {
	type EncryptTokenError,
	type SaveUserDatabaseCredentialsError,
	saveUserDatabaseCredentials,
} from "@next-lift/authentication/user-database-credentials";
import {
	type ApplyMigrationError,
	applyMigration,
} from "@next-lift/per-user-database/apply-migration";
import {
	type CreateTursoPerUserDatabaseError,
	createTursoPerUserDatabase,
} from "@next-lift/per-user-database/create-database";
import { R } from "@praha/byethrow";

export type SetupPerUserDatabaseError =
	| CreateTursoPerUserDatabaseError
	| ApplyMigrationError
	| SaveUserDatabaseCredentialsError
	| EncryptTokenError;

/**
 * Per-User Databaseをセットアップする（冪等）
 * 1. Turso Platform APIでDBを作成（すでに存在する場合は既存を使用）
 * 2. マイグレーションを適用（適用済みの場合はスキップ）
 * 3. Authentication DBに情報を保存（暗号化含む、UPSERT）
 */
export const setupPerUserDatabase = ({
	userId,
	now,
}: {
	userId: string;
	now?: Date;
}): R.ResultAsync<void, SetupPerUserDatabaseError> =>
	R.pipe(
		R.do(),
		R.bind("createdDatabase", () => createTursoPerUserDatabase(userId, now)),
		R.andThrough(({ createdDatabase }) =>
			applyMigration({
				url: createdDatabase.url,
				authToken: createdDatabase.authToken,
			}),
		),
		R.andThen(({ createdDatabase }) =>
			saveUserDatabaseCredentials({
				userId,
				dbName: createdDatabase.name,
				url: createdDatabase.url,
				token: createdDatabase.authToken,
				expiresAt: createdDatabase.expiresAt,
			}),
		),
	);
