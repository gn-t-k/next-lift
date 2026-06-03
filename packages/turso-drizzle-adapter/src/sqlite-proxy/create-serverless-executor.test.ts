import type {
	Client,
	InArgs,
	ResultSet,
} from "@tursodatabase/serverless/compat";
import { describe, expect, test, vi } from "vitest";
import { createServerlessExecutor } from "./create-serverless-executor";

const buildResultSet = (overrides: Partial<ResultSet>): ResultSet => ({
	columns: [],
	columnTypes: [],
	rows: [],
	rowsAffected: 0,
	lastInsertRowid: undefined,
	toJSON: () => ({}),
	...overrides,
});

const buildRow = (
	columns: string[],
	values: unknown[],
): ResultSet["rows"][number] => {
	const row: Record<string, unknown> = {};
	for (const [index, column] of columns.entries()) {
		row[column] = values[index];
	}
	return row as unknown as ResultSet["rows"][number];
};

const buildClient = (
	execute: (sql: string, args?: InArgs) => Promise<ResultSet>,
): Client => {
	const fn = vi.fn(execute);
	return { execute: fn } as unknown as Client;
};

describe("createServerlessExecutor", () => {
	describe("run のとき", () => {
		test("rowsAffected と lastInsertRowid（bigint → number）を返すこと", async () => {
			const client = buildClient(async () =>
				buildResultSet({ rowsAffected: 1, lastInsertRowid: 42n }),
			);
			const executor = createServerlessExecutor(client);

			const result = await executor.run("INSERT INTO users (name) VALUES (?)", [
				"Alice",
			]);

			expect(result).toEqual({ rowsAffected: 1, lastInsertRowid: 42 });
		});

		test("lastInsertRowid が undefined のときはプロパティを含めず rowsAffected のみ返すこと", async () => {
			const client = buildClient(async () =>
				buildResultSet({ rowsAffected: 0 }),
			);
			const executor = createServerlessExecutor(client);

			const result = await executor.run("UPDATE users SET name = ?", ["Bob"]);

			expect(result).toEqual({ rowsAffected: 0 });
		});
	});

	describe("all のとき", () => {
		test("オブジェクト行を columns 順の配列に変換して返すこと", async () => {
			const columns = ["id", "name"];
			const client = buildClient(async () =>
				buildResultSet({
					columns,
					rows: [
						buildRow(columns, [1, "Alice"]),
						buildRow(columns, [2, "Bob"]),
					],
				}),
			);
			const executor = createServerlessExecutor(client);

			const result = await executor.all("SELECT id, name FROM users", []);

			expect(result).toEqual([
				[1, "Alice"],
				[2, "Bob"],
			]);
		});
	});

	describe("get のとき", () => {
		test("先頭行を columns 順の配列で返すこと", async () => {
			const columns = ["id", "name"];
			const client = buildClient(async () =>
				buildResultSet({
					columns,
					rows: [buildRow(columns, [1, "Alice"])],
				}),
			);
			const executor = createServerlessExecutor(client);

			const result = await executor.get(
				"SELECT id, name FROM users WHERE id = ?",
				[1],
			);

			expect(result).toEqual([1, "Alice"]);
		});

		test("行が無いとき undefined を返すこと", async () => {
			const client = buildClient(async () =>
				buildResultSet({ columns: ["id"], rows: [] }),
			);
			const executor = createServerlessExecutor(client);

			const result = await executor.get(
				"SELECT id FROM users WHERE id = ?",
				[999],
			);

			expect(result).toBeUndefined();
		});
	});

	describe("exec のとき", () => {
		test("client.execute を SQL のみで呼ぶこと", async () => {
			const fn = vi.fn(async () => buildResultSet({}));
			const client = { execute: fn } as unknown as Client;
			const executor = createServerlessExecutor(client);

			await executor.exec("PRAGMA foreign_keys = ON");

			expect(fn).toHaveBeenCalledWith("PRAGMA foreign_keys = ON");
		});
	});
});
