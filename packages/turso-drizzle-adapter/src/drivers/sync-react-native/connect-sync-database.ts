import {
	connect,
	type Database,
	type DatabaseOpts,
} from "@tursodatabase/sync-react-native";

export const connectSyncDatabase = async (
	opts: DatabaseOpts,
): Promise<Database> => {
	return await connect(opts);
};
