import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	// @ts-expect-error - React Routerによってビルド時に提供される仮想モジュール
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch: async (request, env, ctx) => {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
