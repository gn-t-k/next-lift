import * as Sentry from "@sentry/nextjs";

Sentry.init({
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでも実行される可能性があるため、グローバルprocessの使用が必要
	dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"] || "",
	tracesSampleRate: 1.0,
	debug: false,
});
