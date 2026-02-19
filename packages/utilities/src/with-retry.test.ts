import { beforeEach, describe, expect, test, vi } from "vitest";
import { exponentialBackoff, withRetry } from "./with-retry";

describe("withRetry", () => {
	describe("1回目で成功する場合", () => {
		const fn = vi.fn();

		beforeEach(() => {
			fn.mockResolvedValue("success");
		});

		test("値が返ること", async () => {
			const result = await withRetry(fn, { backoff: () => 0 });

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe("N回失敗後に成功する場合", () => {
		const fn = vi.fn();

		beforeEach(() => {
			fn.mockRejectedValueOnce(new Error("fail 1"))
				.mockRejectedValueOnce(new Error("fail 2"))
				.mockResolvedValue("success");
		});

		test("リトライ後に値が返ること", async () => {
			const result = await withRetry(fn, { backoff: () => 0 });

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(3);
		});
	});

	describe("全リトライが失敗する場合", () => {
		const fn = vi.fn();

		beforeEach(() => {
			fn.mockRejectedValueOnce(new Error("fail 1"))
				.mockRejectedValueOnce(new Error("fail 2"))
				.mockRejectedValueOnce(new Error("fail 3"))
				.mockRejectedValue(new Error("last error"));
		});

		test("最後のエラーがthrowされること", async () => {
			await expect(withRetry(fn, { backoff: () => 0 })).rejects.toThrow(
				"last error",
			);
			expect(fn).toHaveBeenCalledTimes(4);
		});
	});

	describe("リトライ中のbackoff呼び出し", () => {
		const backoff = vi.fn();
		const fn = vi.fn();

		beforeEach(() => {
			backoff.mockReturnValue(0);
			fn.mockRejectedValueOnce(new Error("fail 1"))
				.mockRejectedValueOnce(new Error("fail 2"))
				.mockResolvedValue("success");
		});

		test("正しいattemptで呼ばれること", async () => {
			await withRetry(fn, { backoff });

			expect(backoff).toHaveBeenCalledTimes(2);
			expect(backoff).toHaveBeenNthCalledWith(1, 0);
			expect(backoff).toHaveBeenNthCalledWith(2, 1);
		});
	});

	describe("カスタムmaxRetriesを指定した場合", () => {
		const fn = vi.fn();

		beforeEach(() => {
			fn.mockRejectedValue(new Error("fail"));
		});

		test("指定回数+1回で打ち切られること", async () => {
			await expect(
				withRetry(fn, { maxRetries: 1, backoff: () => 0 }),
			).rejects.toThrow("fail");
			expect(fn).toHaveBeenCalledTimes(2);
		});
	});
});

describe("exponentialBackoff", () => {
	describe("正常系", () => {
		test("指数的に増加する値を返すこと", () => {
			const backoff = exponentialBackoff(1000);

			expect(backoff(0)).toBe(1000);
			expect(backoff(1)).toBe(2000);
			expect(backoff(2)).toBe(4000);
			expect(backoff(3)).toBe(8000);
		});
	});
});
