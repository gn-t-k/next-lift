import type {
	Database,
	Row,
	RunResult,
} from "@tursodatabase/sync-react-native";
import { describe, expect, test, vi } from "vitest";
import { createSyncReactNativeExecutor } from "./create-sync-react-native-executor";

const buildDatabase = (overrides: Partial<Database>): Database => {
	return overrides as unknown as Database;
};

describe("createSyncReactNativeExecutor", () => {
	describe("run のとき", () => {
		test("rowsAffected と lastInsertRowid を返すこと", async () => {
			const run = vi.fn(
				async () =>
					({
						changes: 1,
						lastInsertRowid: 42,
					}) satisfies RunResult,
			);
			const database = buildDatabase({ run });
			const executor = createSyncReactNativeExecutor(database);

			const result = await executor.run("INSERT INTO users (name) VALUES (?)", [
				"Alice",
			]);

			expect(result).toEqual({ rowsAffected: 1, lastInsertRowid: 42 });
			expect(run).toHaveBeenCalledWith(
				"INSERT INTO users (name) VALUES (?)",
				"Alice",
			);
		});
	});

	describe("all のとき", () => {
		test("Row オブジェクトを columns 順の配列に変換して返すこと", async () => {
			const all = vi.fn(
				async () =>
					[
						{ id: 1, name: "Alice" } as Row,
						{ id: 2, name: "Bob" } as Row,
					] satisfies Row[],
			);
			const database = buildDatabase({ all });
			const executor = createSyncReactNativeExecutor(database);

			const result = await executor.all("SELECT id, name FROM users", []);

			expect(result).toEqual([
				[1, "Alice"],
				[2, "Bob"],
			]);
		});
	});

	describe("get のとき", () => {
		test("先頭 Row を columns 順の配列で返すこと", async () => {
			const get = vi.fn(async () => ({ id: 1, name: "Alice" }) as Row);
			const database = buildDatabase({ get });
			const executor = createSyncReactNativeExecutor(database);

			const result = await executor.get(
				"SELECT id, name FROM users WHERE id = ?",
				[1],
			);

			expect(result).toEqual([1, "Alice"]);
		});

		test("行が無いとき undefined を返すこと", async () => {
			const get = vi.fn(async () => undefined);
			const database = buildDatabase({ get });
			const executor = createSyncReactNativeExecutor(database);

			const result = await executor.get(
				"SELECT id FROM users WHERE id = ?",
				[999],
			);

			expect(result).toBeUndefined();
		});
	});

	describe("exec のとき", () => {
		test("database.exec を SQL のみで呼ぶこと", async () => {
			const exec = vi.fn(async () => undefined);
			const database = buildDatabase({ exec });
			const executor = createSyncReactNativeExecutor(database);

			await executor.exec("PRAGMA foreign_keys = ON");

			expect(exec).toHaveBeenCalledWith("PRAGMA foreign_keys = ON");
		});
	});
});
