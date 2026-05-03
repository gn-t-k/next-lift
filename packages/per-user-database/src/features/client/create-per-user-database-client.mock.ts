import type { Client } from "@tursodatabase/serverless/compat";
import { vi } from "vitest";
import { mockedPerUserDatabase } from "../../testing/mocked-per-user-database";
import * as module from "./create-per-user-database-client";

// テスト経路では HTTP プロトコル前提の compat client を実体化できないため、最小限のスタブを返す
const mockClient = {
	execute: vi.fn().mockResolvedValue({}),
} as unknown as Client;

export const mockCreatePerUserDatabaseClientOk = () => {
	return vi
		.spyOn(module, "createPerUserDatabaseClient")
		.mockResolvedValue({ db: mockedPerUserDatabase, client: mockClient });
};

export const mockCreatePerUserDatabaseClientError = (error: Error) => {
	return vi
		.spyOn(module, "createPerUserDatabaseClient")
		.mockRejectedValue(error);
};
