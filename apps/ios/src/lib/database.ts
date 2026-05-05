import { schema } from "@next-lift/per-user-database/database-schemas";
import migrations from "@next-lift/per-user-database/migrations";
import {
	applyMigrationsToSyncReactNative,
	connectSyncDatabase,
	createDrizzleFromSyncReactNative,
} from "@next-lift/turso-drizzle-adapter/sync-react-native";
import { resolveCredentials } from "./credentials";

export const initializeDatabase = async () => {
	const credentials = await resolveCredentials();

	const database = await connectSyncDatabase({
		path: "per-user.db",
		url: credentials.url,
		authToken: credentials.authToken,
	});

	await applyMigrationsToSyncReactNative(database, migrations);

	const db = createDrizzleFromSyncReactNative(database, schema);

	return {
		db,
		pull: async (): Promise<void> => {
			await database.pull();
		},
		push: async (): Promise<void> => {
			await database.push();
		},
	};
};

export type InitializedDatabase = Awaited<
	ReturnType<typeof initializeDatabase>
>;
export type PerUserDatabase = InitializedDatabase["db"];
