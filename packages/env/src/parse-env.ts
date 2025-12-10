import { createLazyProxy } from "@next-lift/utilities";
import type { z } from "zod";

/**
 * アプリ用: buildSchemaは即座に検証、deploySchemaは遅延評価
 *
 * - buildSchema: モジュール読み込み時に検証
 * - deploySchema: プロパティアクセス時に検証（遅延評価）
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
	// ビルド時スキーマを即座に検証
	const buildTimeParseResult = staticEnvSchema.safeParse(env);
	if (!buildTimeParseResult.success) {
		throw new Error(formatZodError(buildTimeParseResult.error));
	}

	const runtimeEnvSchema = staticEnvSchema.extend(dynamicEnvSchema);
	const parseRuntimeEnv = () => {
		const runtimeParseResult = runtimeEnvSchema.safeParse(env);
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
