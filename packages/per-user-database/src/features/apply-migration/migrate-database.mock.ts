import { vi } from "vitest";
import * as module from "./migrate-database";

export const mockMigrateDatabaseOk = () => {
	return vi.spyOn(module, "migrateDatabase").mockResolvedValue(undefined);
};

export const mockMigrateDatabaseError = (error: Error) => {
	return vi.spyOn(module, "migrateDatabase").mockRejectedValue(error);
};
