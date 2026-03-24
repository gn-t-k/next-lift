import { createContext } from "@praha/diva";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "../database-schemas";
import { createDatabaseClient } from "./get-database";

export const [getDatabase, withDatabase] =
	createContext<LibSQLDatabase<typeof schema>>();

export const withAuthenticationDatabase = withDatabase(createDatabaseClient);
