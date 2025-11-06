export const register = async () => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	// biome-ignore lint/correctness/noProcessGlobal: Edge/Node両Runtimeで実行されるため、グローバルprocessの使用が必要
	if (process.env["NEXT_RUNTIME"] === "nodejs") {
		await import("../sentry.server.config");
	}

	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	// biome-ignore lint/correctness/noProcessGlobal: Edge/Node両Runtimeで実行されるため、グローバルprocessの使用が必要
	if (process.env["NEXT_RUNTIME"] === "edge") {
		await import("../sentry.edge.config");
	}
};
