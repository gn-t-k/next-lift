export const createSharedEnvConfig = () => ({
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
	runtimeEnv: process.env,
	skipValidation:
		// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeとの互換性のためグローバルprocessを使用
		// biome-ignore lint/complexity/useLiteralKeys: TypeScriptの厳格な型チェックのためブラケット記法を使用
		process.env["npm_lifecycle_event"] === "lint",
	emptyStringAsUndefined: true,
});
