import { execSync } from "node:child_process";
import process from "node:process";
import { describe, expect, test } from "vitest";

describe("check", () => {
	const run = (envVars: Record<string, string>) => {
		return execSync("npx tsx src/env/check.ts", {
			cwd: import.meta.dirname?.replace("/src/env", "") ?? process.cwd(),
			env: {
				...envVars,
				PATH: process.env["PATH"],
			} as unknown as NodeJS.ProcessEnv,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
	};

	describe("有効な環境変数が設定されている場合", () => {
		test("成功メッセージが出力されること", () => {
			const output = run({
				EXPO_PUBLIC_API_URL: "https://example.com",
				EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client-id",
				EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client-id",
			});

			expect(output).toContain("✅");
		});
	});

	describe("環境変数が未設定の場合", () => {
		test("プロセスが非ゼロ終了すること", () => {
			expect(() => run({})).toThrow();
		});
	});
});
