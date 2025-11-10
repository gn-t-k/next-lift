"use client";

import { RouterProvider } from "@next-lift/react-components/lib";
import type { Route } from "next";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import type { ComponentProps, FC, PropsWithChildren } from "react";

declare module "@next-lift/react-components/lib" {
	interface RouterConfig {
		routerOptions: NavigateOptions;
	}
}

declare module "@next-lift/react-components/ui" {
	interface LinkConfig {
		href?: Route;
	}
}

export const RouterAdapter: FC<PropsWithChildren> = ({ children }) => {
	const router = useRouter();

	const navigate: ComponentProps<typeof RouterProvider>["navigate"] = (
		path,
		options,
	) => {
		router.push(path as Route, options);
	};

	return <RouterProvider navigate={navigate}>{children}</RouterProvider>;
};
