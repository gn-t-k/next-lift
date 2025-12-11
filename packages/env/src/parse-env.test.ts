import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { parseEnv } from "./parse-env";

describe("parseEnv", () => {
	describe("lazy=false（デフォルト）", () => {
		test("staticとdynamicの両方が即座に検証され、マージされた結果が返る", () => {
			const staticEnvSchema = z.object({
				STATIC_VAR: z.string(),
			});
			const dynamicEnvSchema = z.object({
				DYNAMIC_VAR: z.string(),
			});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: {
					STATIC_VAR: "static_value",
					DYNAMIC_VAR: "dynamic_value",
				},
			});

			expect(result.STATIC_VAR).toBe("static_value");
			expect(result.DYNAMIC_VAR).toBe("dynamic_value");
		});

		test("staticスキーマの検証失敗時、エラーがスローされる", () => {
			const staticEnvSchema = z.object({
				REQUIRED_VAR: z.string(),
			});
			const dynamicEnvSchema = z.object({});

			expect(() =>
				parseEnv({
					staticEnvSchema,
					dynamicEnvSchema,
					env: {},
				}),
			).toThrow("環境変数の検証エラー:");
		});

		test("dynamicスキーマの検証失敗時、エラーがスローされる", () => {
			const staticEnvSchema = z.object({});
			const dynamicEnvSchema = z.object({
				REQUIRED_VAR: z.string(),
			});

			expect(() =>
				parseEnv({
					staticEnvSchema,
					dynamicEnvSchema,
					env: {},
				}),
			).toThrow("環境変数の検証エラー:");
		});

		test("戻り値がObject.freezeされている", () => {
			const staticEnvSchema = z.object({
				VAR: z.string(),
			});
			const dynamicEnvSchema = z.object({});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { VAR: "value" },
			});

			expect(Object.isFrozen(result)).toBe(true);
		});
	});

	describe("lazy=true", () => {
		test("staticは即座に検証される", () => {
			const staticEnvSchema = z.object({
				REQUIRED_VAR: z.string(),
			});
			const dynamicEnvSchema = z.object({});

			expect(() =>
				parseEnv({
					staticEnvSchema,
					dynamicEnvSchema,
					env: {},
					lazy: true,
				}),
			).toThrow("環境変数の検証エラー:");
		});

		test("dynamicはプロパティアクセスまで検証されない", () => {
			const staticEnvSchema = z.object({
				STATIC_VAR: z.string(),
			});
			const dynamicEnvSchema = z.object({
				REQUIRED_DYNAMIC: z.string(),
			});

			// lazy=trueの場合、parseEnv呼び出し時点ではエラーにならない
			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { STATIC_VAR: "value" }, // REQUIRED_DYNAMICがない
				lazy: true,
			});

			// staticキーへのアクセスは成功
			expect(result.STATIC_VAR).toBe("value");

			// dynamicキーへのアクセスでエラー
			expect(() => result.REQUIRED_DYNAMIC).toThrow("環境変数の検証エラー:");
		});

		test("staticキーへのアクセスはdynamic検証をトリガーしない", () => {
			const dynamicParseSpy = vi.fn();
			const staticEnvSchema = z.object({
				STATIC_VAR: z.string(),
			});
			const dynamicEnvSchema = z
				.object({
					DYNAMIC_VAR: z.string(),
				})
				.superRefine((_data, ctx) => {
					dynamicParseSpy();
					// 検証に失敗させる
					ctx.addIssue({
						code: "custom",
						message: "Dynamic validation triggered",
					});
				});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { STATIC_VAR: "value", DYNAMIC_VAR: "value" },
				lazy: true,
			});

			// staticキーへのアクセス
			expect(result.STATIC_VAR).toBe("value");

			// dynamicのパースはまだ呼ばれていない
			expect(dynamicParseSpy).not.toHaveBeenCalled();
		});

		test("dynamicキーへのアクセスで検証がトリガーされる", () => {
			const dynamicParseSpy = vi.fn();
			const staticEnvSchema = z.object({
				STATIC_VAR: z.string(),
			});
			const dynamicEnvSchema = z
				.object({
					DYNAMIC_VAR: z.string(),
				})
				.superRefine(() => {
					dynamicParseSpy();
				});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { STATIC_VAR: "value", DYNAMIC_VAR: "dynamic_value" },
				lazy: true,
			});

			expect(dynamicParseSpy).not.toHaveBeenCalled();

			// dynamicキーへのアクセス
			expect(result.DYNAMIC_VAR).toBe("dynamic_value");
			expect(dynamicParseSpy).toHaveBeenCalledOnce();
		});

		test("一度検証されたら結果がキャッシュされる", () => {
			const dynamicParseSpy = vi.fn();
			const staticEnvSchema = z.object({});
			const dynamicEnvSchema = z
				.object({
					DYNAMIC_VAR: z.string(),
				})
				.superRefine(() => {
					dynamicParseSpy();
				});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { DYNAMIC_VAR: "value" },
				lazy: true,
			});

			// 複数回アクセス
			result.DYNAMIC_VAR;
			result.DYNAMIC_VAR;
			result.DYNAMIC_VAR;

			// パースは1回のみ
			expect(dynamicParseSpy).toHaveBeenCalledOnce();
		});
	});

	describe("lazy=true と staticEnvSchema の ZodEffects", () => {
		test("staticEnvSchema に superRefine を適用した場合、静的キーが正しく認識される", () => {
			const dynamicParseSpy = vi.fn();

			const staticEnvSchema = z
				.object({
					NODE_ENV: z.enum(["development", "production", "test"]),
				})
				.superRefine(() => {
					// staticのsuperRefine
				});

			const dynamicEnvSchema = z
				.object({
					API_URL: z.url(),
				})
				.superRefine(() => {
					dynamicParseSpy();
				});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: {
					NODE_ENV: "development",
					API_URL: "https://example.com",
				},
				lazy: true,
			});

			// staticキーへのアクセス前: dynamic検証はまだ呼ばれていない
			expect(dynamicParseSpy).not.toHaveBeenCalled();

			// staticキーへのアクセス: dynamic検証がトリガーされてはいけない
			expect(result.NODE_ENV).toBe("development");
			expect(dynamicParseSpy).not.toHaveBeenCalled(); // ← ここで失敗するはず

			// dynamicキーへのアクセスで検証がトリガーされる
			expect(result.API_URL).toBe("https://example.com");
			expect(dynamicParseSpy).toHaveBeenCalledOnce();
		});

		test("staticEnvSchema に refine を適用した場合も静的キーが正しく認識される", () => {
			const dynamicParseSpy = vi.fn();

			const staticEnvSchema = z
				.object({
					PORT: z.coerce.number(),
				})
				.refine((data) => data.PORT > 0, "PORT must be positive");

			const dynamicEnvSchema = z
				.object({
					API_URL: z.url(),
				})
				.superRefine(() => {
					dynamicParseSpy();
				});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { PORT: "3000", API_URL: "https://example.com" },
				lazy: true,
			});

			// staticキーへのアクセス前: dynamic検証はまだ呼ばれていない
			expect(dynamicParseSpy).not.toHaveBeenCalled();

			// staticキーへのアクセス: dynamic検証がトリガーされてはいけない
			expect(result.PORT).toBe(3000);
			expect(dynamicParseSpy).not.toHaveBeenCalled(); // ← ここで失敗するはず
		});
	});

	describe("ZodEffects対応", () => {
		test("superRefineを含むスキーマで動作する", () => {
			const staticEnvSchema = z.object({
				URL: z.string(),
			});
			const dynamicEnvSchema = z
				.object({
					TOKEN: z.string().optional(),
				})
				.superRefine((data, ctx) => {
					// URLが特定のパターンの場合、TOKENを必須にする
					if (!data.TOKEN) {
						ctx.addIssue({
							code: "custom",
							message: "TOKEN is required",
							path: ["TOKEN"],
						});
					}
				});

			// TOKENがある場合は成功
			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { URL: "https://example.com", TOKEN: "secret" },
			});
			expect(result.URL).toBe("https://example.com");
			expect(result.TOKEN).toBe("secret");

			// TOKENがない場合は失敗
			expect(() =>
				parseEnv({
					staticEnvSchema,
					dynamicEnvSchema,
					env: { URL: "https://example.com" },
				}),
			).toThrow("環境変数の検証エラー:");
		});

		test("transformを含むスキーマで動作する", () => {
			const staticEnvSchema = z.object({
				PORT: z.string().transform((val) => Number.parseInt(val, 10)),
			});
			const dynamicEnvSchema = z.object({});

			const result = parseEnv({
				staticEnvSchema,
				dynamicEnvSchema,
				env: { PORT: "3000" },
			});

			expect(result.PORT).toBe(3000);
		});
	});

	describe("エラーフォーマット", () => {
		test("エラーメッセージに環境変数の値が含まれない", () => {
			const staticEnvSchema = z.object({
				SECRET_KEY: z.string().min(10),
			});
			const dynamicEnvSchema = z.object({});

			try {
				parseEnv({
					staticEnvSchema,
					dynamicEnvSchema,
					env: { SECRET_KEY: "short" },
				});
				expect.fail("Should have thrown");
			} catch (error) {
				const message = (error as Error).message;
				// 値（"short"）が含まれていないことを確認
				expect(message).not.toContain("short");
				// パスとエラーコードは含まれている
				expect(message).toContain("SECRET_KEY");
			}
		});

		test("複数のエラーがまとめて報告される", () => {
			const staticEnvSchema = z.object({
				VAR1: z.string(),
				VAR2: z.string(),
				VAR3: z.string(),
			});
			const dynamicEnvSchema = z.object({});

			try {
				parseEnv({
					staticEnvSchema,
					dynamicEnvSchema,
					env: {},
				});
				expect.fail("Should have thrown");
			} catch (error) {
				const message = (error as Error).message;
				expect(message).toContain("VAR1");
				expect(message).toContain("VAR2");
				expect(message).toContain("VAR3");
			}
		});
	});
});
