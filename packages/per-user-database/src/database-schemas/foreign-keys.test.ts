import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { mockedPerUserDatabase } from "../testing/mocked-per-user-database";
import { days } from "./days";
import { programs } from "./programs";

// drizzleはlibsqlのエラーをラップして"Failed query: ..."形式で投げるため、causeチェーンを辿って元エラーを取り出す
const rootCauseMessage = (e: unknown): string => {
	let current: unknown = e;
	while (current instanceof Error && current.cause != null) {
		current = current.cause;
	}
	return current instanceof Error ? current.message : String(current);
};

// 全テーブルにFK制約を張る方針（ADR-026）が実際にDBレベルで効いていることを担保する。
// 代表として programs ← days の親子関係を検証する。他のFKは Drizzle のスキーマ定義生成で同様に張られる。
describe("外部キー制約", () => {
	describe("親レコードが存在しない子レコードのINSERT", () => {
		test("FK違反でエラーになること", async () => {
			const error = await mockedPerUserDatabase
				.insert(days)
				.values({
					id: "day-1",
					programId: "non-existent-program",
					label: "Day 1",
					displayOrder: 1,
				})
				.catch((e: unknown) => e);

			expect(error).toBeInstanceOf(Error);
			expect(rootCauseMessage(error)).toMatch(/FOREIGN KEY/);
		});
	});

	describe("子レコードが残っている親レコードのDELETE", () => {
		test("FK違反でエラーになること（ON DELETE NO ACTION）", async () => {
			await mockedPerUserDatabase
				.insert(programs)
				.values({ id: "program-1", name: "Program 1", metaInfo: null });
			await mockedPerUserDatabase.insert(days).values({
				id: "day-1",
				programId: "program-1",
				label: "Day 1",
				displayOrder: 1,
			});

			const error = await mockedPerUserDatabase
				.delete(programs)
				.where(eq(programs.id, "program-1"))
				.catch((e: unknown) => e);

			expect(error).toBeInstanceOf(Error);
			expect(rootCauseMessage(error)).toMatch(/FOREIGN KEY/);
		});
	});

	describe("子→親の順でDELETE", () => {
		test("正常に削除できること", async () => {
			await mockedPerUserDatabase
				.insert(programs)
				.values({ id: "program-1", name: "Program 1", metaInfo: null });
			await mockedPerUserDatabase.insert(days).values({
				id: "day-1",
				programId: "program-1",
				label: "Day 1",
				displayOrder: 1,
			});

			await mockedPerUserDatabase.delete(days).where(eq(days.id, "day-1"));
			await mockedPerUserDatabase
				.delete(programs)
				.where(eq(programs.id, "program-1"));

			const remainingPrograms = await mockedPerUserDatabase
				.select()
				.from(programs);
			expect(remainingPrograms).toHaveLength(0);
		});
	});
});
