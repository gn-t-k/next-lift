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
	StaticEnvSchema extends z.ZodObject,
	DynamicEnvSchema extends z.ZodObject,
>({
	staticEnvSchema,
	dynamicEnvSchema,
	env,
	lazy = false,
}: {
	staticEnvSchema: StaticEnvSchema;
	dynamicEnvSchema: DynamicEnvSchema;
	env: typeof process.env;
	lazy?: boolean;
}): Readonly<z.infer<StaticEnvSchema> & z.infer<DynamicEnvSchema>> => {
	const buildTimeParseResult = staticEnvSchema.safeParse(env);
	if (!buildTimeParseResult.success) {
		throw new Error(formatZodError(buildTimeParseResult.error));
	}

	const parseRuntimeEnv = () => {
		const runtimeParseResult = staticEnvSchema
			.extend(dynamicEnvSchema)
			.safeParse(env);
		if (!runtimeParseResult.success) {
			throw new Error(formatZodError(runtimeParseResult.error));
		}
		return Object.freeze(runtimeParseResult.data) as Readonly<
			z.infer<StaticEnvSchema> & z.infer<DynamicEnvSchema>
		>;
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
