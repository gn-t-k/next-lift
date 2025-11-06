import * as Sentry from "@sentry/nextjs";

Sentry.init({
	// biome-ignore lint/correctness/noProcessGlobal: ブラウザ環境では`node:process`のimportが不可のため、グローバルprocessの使用が唯一の選択肢
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"] || "",
	tracesSampleRate: 1.0,
	debug: false,
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
