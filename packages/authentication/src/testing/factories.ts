import { composeFactory } from "@praha/drizzle-factory";
import { accountFactory } from "../database-schemas/account/account-factory";
import { perUserDatabaseFactory } from "../database-schemas/per-user-database/per-user-database-factory";
import { sessionFactory } from "../database-schemas/session/session-factory";
import { userFactory } from "../database-schemas/user/user-factory";

export const factories = composeFactory({
	users: userFactory,
	sessions: sessionFactory,
	accounts: accountFactory,
	perUserDatabases: perUserDatabaseFactory,
});
