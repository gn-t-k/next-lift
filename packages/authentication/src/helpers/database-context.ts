import type { SqliteRunResult } from "@next-lift/per-user-database/adapter";
import { createContext } from "@praha/diva";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type * as schema from "../database-schemas";
import { createDatabaseClient } from "./get-database";

export const [getDatabase, withDatabase] =
	createContext<BaseSQLiteDatabase<"async", SqliteRunResult, typeof schema>>();

export const withAuthenticationDatabase = withDatabase(createDatabaseClient);
