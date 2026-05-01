import type { SqliteRunResult } from "@next-lift/turso-drizzle-adapter";
import { createContext } from "@praha/diva";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "../database-schemas";

export const [getPerUserDatabase, withPerUserDatabase] =
	createContext<BaseSQLiteDatabase<"async", SqliteRunResult, typeof schema>>();
