import { createLazyProxy } from "@next-lift/utilities";
import type { z } from "zod";

/**
 * 環境変数を2段階のZodスキーマで検証し、型安全なオブジェクトを返す
 *
 * Next.jsのSSGではビルド時に環境変数が必要だが、プレビュー環境のURLなどビルド時に確定しない値があるため、検証タイミングを分離している
 *
 * @param staticEnvSchema - モジュール読込時に検証されるスキーマ
 * @param dynamicEnvSchema - lazyオプションに応じて検証タイミングが変わるスキーマ
 * @param env - 検証対象の環境変数オブジェクト
 * @param lazy - falseならモジュール読込時、trueならプロパティアクセス時に検証
 */
export const parseEnv = <
	StaticEnvSchema extends z.ZodType,
	DynamicEnvSchema extends z.ZodType,
>({
	staticEnvSchema,
	dynamicEnvSchema,
	env,
	lazy = false,
}: {
	staticEnvSchema: StaticEnvSchema;
	dynamicEnvSchema: DynamicEnvSchema;
	env: Record<string, string | undefined>;
	lazy?: boolean;
}): Readonly<z.infer<StaticEnvSchema> & z.infer<DynamicEnvSchema>> => {
	const buildTimeParseResult = staticEnvSchema.safeParse(env);
	if (!buildTimeParseResult.success) {
		throw new Error(formatZodError(buildTimeParseResult.error));
	}

	const parseRuntimeEnv = () => {
		// staticEnvSchema と dynamicEnvSchema を別々にパースして結果をマージする
		// dynamicEnvSchema が ZodEffects（superRefine等）の場合、extend() は使えないため
		const staticParseResult = staticEnvSchema.safeParse(env);
		if (!staticParseResult.success) {
			throw new Error(formatZodError(staticParseResult.error));
		}

		const dynamicParseResult = dynamicEnvSchema.safeParse(env);
		if (!dynamicParseResult.success) {
			throw new Error(formatZodError(dynamicParseResult.error));
		}

		return Object.freeze(
			// biome-ignore lint/style/useObjectSpread: ZodType の infer 結果はスプレッド不可のため Object.assign を使用
			Object.assign({}, staticParseResult.data, dynamicParseResult.data),
		) as Readonly<z.infer<StaticEnvSchema> & z.infer<DynamicEnvSchema>>;
	};

	if (!lazy) {
		return parseRuntimeEnv();
	}

	return createLazyProxy(() => {
		return parseRuntimeEnv();
	});
};

/**
 * セキュリティのため、値を含まない形にフォーマットする
 */
const formatZodError = (error: z.ZodError): string =>
	error.issues
		.map(
			(issue) =>
				`  - ${issue.path.join(".")}: ${issue.message} (${issue.code})`,
		)
		.reduce(
			(message, issue) => `${message}\n${issue}`,
			"環境変数の検証エラー:",
		);
