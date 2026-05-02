import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	applyMigrationsToTursoServerless,
	createTursoServerlessClient,
} from "@next-lift/turso-drizzle-adapter";
import { R } from "@praha/byethrow";
import { ErrorFactory } from "@praha/error-factory";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../../drizzle");

export class ApplyAuthMigrationError extends ErrorFactory({
	name: "ApplyAuthMigrationError",
	message: "Auth DBマイグレーションの実行中にエラーが発生しました。",
}) {}

export const applyAuthMigration = (config: {
	url: string;
	authToken: string;
}): R.ResultAsync<void, ApplyAuthMigrationError> =>
	R.try({
		try: async () => {
			const client = createTursoServerlessClient({
				url: config.url,
				authToken: config.authToken,
			});
			await applyMigrationsToTursoServerless(client, migrationsFolder);
		},
		catch: (e) => new ApplyAuthMigrationError({ cause: e }),
	});
