import * as Sentry from "@sentry/nextjs";

Sentry.init({
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可のため、グローバルprocessの使用が唯一の選択肢
	dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"] || "",
	tracesSampleRate: 1.0,
	debug: false,
});
