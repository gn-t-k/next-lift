export const register = async () => {
	// NEXT_RUNTIMEはNext.jsが自動設定する環境変数のため、packages/envで定義しない
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可
	// biome-ignore lint/complexity/useLiteralKeys: NEXT_RUNTIMEは型定義にないためブラケット記法を使用
	const runtime = process.env["NEXT_RUNTIME"];

	if (runtime === "nodejs") {
		await import("../sentry.server.config");
	}

	if (runtime === "edge") {
		await import("../sentry.edge.config");
	}
};
