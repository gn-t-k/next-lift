import { createContext } from "@praha/diva";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "../database-schemas";

export const [getPerUserDatabase, withPerUserDatabase] =
	createContext<LibSQLDatabase<typeof schema>>();
