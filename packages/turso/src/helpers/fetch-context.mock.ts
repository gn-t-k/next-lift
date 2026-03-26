import { mockContext } from "@praha/diva/test";
import { vi } from "vitest";
import { withFetch } from "./fetch-context";

export const mockFetch = vi.fn();
mockContext.transient(withFetch, () => mockFetch);

type DatabaseResponse = {
	DbId: string;
	Hostname: string;
	Name: string;
};

// --- create-database ---

export const mockFetchCreateDatabaseOk = (
	overrides?: Partial<DatabaseResponse>,
) => {
	return mockFetch.mockResolvedValue({
		ok: true,
		status: 201,
		json: async () => ({
			database: {
				DbId: "mock-db-id",
				Hostname: "mock-hostname.turso.io",
				Name: "mock-db-name",
				...overrides,
			},
		}),
	});
};

export const mockFetchCreateDatabaseConflictOk = (
	overrides?: Partial<DatabaseResponse>,
) => {
	return mockFetch
		.mockResolvedValueOnce({
			ok: false,
			status: 409,
		})
		.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
				database: {
					DbId: "existing-db-id",
					Hostname: "existing-db.turso.io",
					Name: "existing-db",
					...overrides,
				},
			}),
		});
};

export const mockFetchCreateDatabaseConflictGetDatabaseError = () => {
	return mockFetch
		.mockResolvedValueOnce({
			ok: false,
			status: 409,
		})
		.mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
			text: async () => "Server error",
		});
};

export const mockFetchCreateDatabaseConflictNotFound = () => {
	return mockFetch
		.mockResolvedValueOnce({
			ok: false,
			status: 409,
		})
		.mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
};

// --- get-database ---

export const mockFetchGetDatabaseOk = (
	overrides?: Partial<DatabaseResponse>,
) => {
	return mockFetch.mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => ({
			database: {
				DbId: "mock-db-id",
				Hostname: "mock-hostname.turso.io",
				Name: "mock-db-name",
				...overrides,
			},
		}),
	});
};

// --- issue-token ---

export const mockFetchIssueTokenOk = (overrides?: Partial<{ jwt: string }>) => {
	return mockFetch.mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => ({
			jwt: overrides?.jwt ?? "mock-jwt-token",
		}),
	});
};

// --- delete-database ---

export const mockFetchDeleteDatabaseOk = () => {
	return mockFetch.mockResolvedValue({
		ok: true,
		status: 200,
	});
};

export const mockFetchDeleteDatabaseNotFound = () => {
	return mockFetch.mockResolvedValue({
		ok: false,
		status: 404,
	});
};

// --- list-databases ---

export const mockFetchListDatabasesOk = (
	databases?: Array<{ Name: string }>,
) => {
	return mockFetch.mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => ({
			databases: databases ?? [],
		}),
	});
};

// --- 共通 ---

export const mockFetchServerError = () => {
	return mockFetch.mockResolvedValue({
		ok: false,
		status: 500,
		statusText: "Internal Server Error",
		text: async () => "Server error details",
	});
};

export const mockFetchNetworkError = () => {
	return mockFetch.mockRejectedValue(new Error("Network error"));
};
