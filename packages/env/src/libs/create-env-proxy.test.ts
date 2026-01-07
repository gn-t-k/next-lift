import { describe, expect, test } from "vitest";
import { createEnvProxy } from "./create-env-proxy";

describe("createEnvProxy", () => {
	test("指定されたキーの値を返す", () => {
		const proxy = createEnvProxy({ FOO: "bar" });
		expect(proxy.FOO).toBe("bar");
	});

	test("複数のキーを指定できる", () => {
		const proxy = createEnvProxy({ FOO: "bar", BAZ: "qux" });
		expect(proxy.FOO).toBe("bar");
		expect(proxy.BAZ).toBe("qux");
	});

	test("指定されていないキーにアクセスするとエラー", () => {
		const proxy = createEnvProxy<"FOO" | "BAZ">({ FOO: "bar" });
		expect(() => proxy.BAZ).toThrow("環境変数 BAZ がモックされていません");
	});
});
