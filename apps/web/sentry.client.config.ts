import process from "node:process";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない
	dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"] || "",
	tracesSampleRate: 1.0,
	debug: false,
});
