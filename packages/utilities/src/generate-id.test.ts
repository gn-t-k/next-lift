import { describe, expect, test } from "vitest";
import { generateId } from "./generate-id";

describe("generateId", () => {
	describe("生成されるIDの形式", () => {
		test("長さが12文字であること", () => {
			const id = generateId();

			expect(id).toHaveLength(12);
		});

		test("0-9a-zの文字のみで構成されること", () => {
			const id = generateId();

			expect(id).toMatch(/^[0-9a-z]+$/);
		});
	});

	describe("一意性", () => {
		test("複数回の呼び出しでそれぞれ異なるIDが生成されること", () => {
			const ids = Array.from({ length: 100 }, () => generateId());
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(ids.length);
		});
	});
});
