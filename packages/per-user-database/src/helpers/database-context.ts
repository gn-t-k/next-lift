import { createContext } from "@praha/diva";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "../database-schemas";
import type { SqliteRunResult } from "../features/client/adapter";

export const [getPerUserDatabase, withPerUserDatabase] =
	createContext<BaseSQLiteDatabase<"async", SqliteRunResult, typeof schema>>();
