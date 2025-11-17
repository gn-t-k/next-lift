import { env } from "@next-lift/env/private";

export const register = async () => {
	if (env.NEXT_RUNTIME === "nodejs") {
		await import("../sentry.server.config");
	}

	if (env.NEXT_RUNTIME === "edge") {
		await import("../sentry.edge.config");
	}
};
