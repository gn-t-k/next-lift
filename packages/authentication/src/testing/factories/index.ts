import { composeFactory } from "@praha/drizzle-factory";
import { accountFactory } from "./account-factory";
import { perUserDatabaseFactory } from "./per-user-database-factory";
import { sessionFactory } from "./session-factory";
import { userFactory } from "./user-factory";

export const factories = composeFactory({
	users: userFactory,
	sessions: sessionFactory,
	accounts: accountFactory,
	perUserDatabases: perUserDatabaseFactory,
});
