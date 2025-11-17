import { env } from "@next-lift/env/private";

export const register = async () => {
	const envVars = env();

	if (envVars.NEXT_RUNTIME === "nodejs") {
		await import("../sentry.server.config");
	}

	if (envVars.NEXT_RUNTIME === "edge") {
		await import("../sentry.edge.config");
	}
};
