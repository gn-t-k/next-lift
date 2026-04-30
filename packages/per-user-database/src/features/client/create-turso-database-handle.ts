import { connect, type Database } from "@tursodatabase/database";

export const createTursoDatabaseHandle = async (
	url: string,
): Promise<Database> => {
	return await connect(url);
};
