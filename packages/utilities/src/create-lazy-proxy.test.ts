import { beforeEach, describe, expect, test, vi } from "vitest";
import { createLazyProxy } from "./create-lazy-proxy";

describe("createLazyProxy", () => {
	describe("Proxy生成時", () => {
		const initializer = vi.fn();

		beforeEach(() => {
			initializer.mockReturnValue({ key: "value" });
			createLazyProxy(initializer);
		});

		test("初期化関数が呼ばれないこと", () => {
			expect(initializer).not.toHaveBeenCalled();
		});
	});

	describe("プロパティに初めてアクセスしたとき", () => {
		const initializer = vi.fn();

		beforeEach(() => {
			initializer.mockReturnValue({ key: "value" });
		});

		test("初期化関数が呼ばれること", () => {
			const proxy = createLazyProxy(initializer);

			proxy.key;

			expect(initializer).toHaveBeenCalledTimes(1);
		});
	});

	describe("プロパティに複数回アクセスしたとき", () => {
		const initializer = vi.fn();

		beforeEach(() => {
			initializer.mockReturnValue({ a: 1, b: 2 });
		});

		test("初期化関数が1回だけ呼ばれること", () => {
			const proxy = createLazyProxy(initializer);

			proxy.a;
			proxy.b;
			proxy.a;

			expect(initializer).toHaveBeenCalledTimes(1);
		});
	});

	describe("プロパティアクセスの委譲", () => {
		const initializer = vi.fn();

		beforeEach(() => {
			initializer.mockReturnValue({ name: "test", count: 42 });
		});

		test("初期化されたオブジェクトのプロパティ値が返ること", () => {
			const proxy = createLazyProxy<{ name: string; count: number }>(
				initializer,
			);

			expect(proxy.name).toBe("test");
			expect(proxy.count).toBe(42);
		});
	});
});
