import type { z } from "zod";

/**
 * 環境変数を2段階のZodスキーマで検証し、型安全なオブジェクトを返す
 *
 * Next.jsのSSGではビルド時に環境変数が必要だが、プレビュー環境のURLなどビルド時に確定しない値があるため、検証タイミングを分離している
 *
 * @param staticEnvSchema - モジュール読込時に検証されるスキーマ
 * @param dynamicEnvSchema - lazyオプションに応じて検証タイミングが変わるスキーマ
 * @param env - 検証対象の環境変数オブジェクト
 * @param lazy - falseならモジュール読込時、trueならdynamicEnvSchemaのプロパティアクセス時に検証
 *
 * @returns staticEnvSchemaとdynamicEnvSchemaをマージした型安全なオブジェクト（lazy=trueの場合Proxyを返すが、ownKeysトラップ未実装のため、`Object.keys`や`for…in`による列挙は不可）
 *
 * @throws 環境変数の検証に失敗した場合、詳細を含むエラーがスローされる
 */
export const parseEnv = <
	// `superRefine`などの`ZodEffects`を扱うために`ZodType`を使用
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
	const staticParseResult = staticEnvSchema.safeParse(env);
	if (!staticParseResult.success) {
		throw new Error(formatZodError(staticParseResult.error));
	}

	const parseDynamicEnv = () => {
		const dynamicParseResult = dynamicEnvSchema.safeParse(env);
		if (!dynamicParseResult.success) {
			throw new Error(formatZodError(dynamicParseResult.error));
		}
		return dynamicParseResult.data;
	};

	if (!lazy) {
		const dynamicData = parseDynamicEnv();
		return Object.freeze(
			// biome-ignore lint/style/useObjectSpread: ZodType の infer 結果はスプレッド不可のため Object.assign を使用
			Object.assign({}, staticParseResult.data, dynamicData),
		);
	}

	const staticKeys = new Set(
		"shape" in staticEnvSchema && staticEnvSchema.shape
			? Object.keys(staticEnvSchema.shape)
			: [],
	);

	let dynamicEnvCache: z.infer<DynamicEnvSchema> | null = null;

	return new Proxy(
		{} as Readonly<z.infer<StaticEnvSchema> & z.infer<DynamicEnvSchema>>,
		{
			get(_target, prop) {
				if (typeof prop !== "string") return undefined;

				const keyType = staticKeys.has(prop) ? "static" : "dynamic";

				switch (keyType) {
					case "static": {
						return (staticParseResult.data as Record<string, unknown>)[prop];
					}
					case "dynamic": {
						if (dynamicEnvCache === null) {
							dynamicEnvCache = parseDynamicEnv();
						}
						return (dynamicEnvCache as Record<string, unknown>)[prop];
					}
				}
			},
		},
	);
};

/**
 * セキュリティのため、値を含まない形にフォーマットする
 */
const formatZodError = (error: z.ZodError): string =>
	`環境変数の検証エラー:\n${error.issues
		.map(
			(issue) =>
				`  - ${issue.path.join(".")}: ${issue.message} (${issue.code})`,
		)
		.join("\n")}`;
