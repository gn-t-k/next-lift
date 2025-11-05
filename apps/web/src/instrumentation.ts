export async function register() {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation
	// biome-ignore lint/correctness/noProcessGlobal: Instrumentation uses global process
	if (process.env["NEXT_RUNTIME"] === "nodejs") {
		await import("../sentry.server.config");
	}

	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation
	// biome-ignore lint/correctness/noProcessGlobal: Instrumentation uses global process
	if (process.env["NEXT_RUNTIME"] === "edge") {
		await import("../sentry.edge.config");
	}
}
