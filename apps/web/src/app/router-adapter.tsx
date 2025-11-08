"use client";

import { RouterProvider } from "@next-lift/react-components/lib";
import { useRouter } from "next/navigation";
import type { FC, PropsWithChildren } from "react";

declare module "@next-lift/react-components/lib" {
	interface RouterConfig {
		routerOptions: NonNullable<
			Parameters<ReturnType<typeof useRouter>["push"]>[1]
		>;
	}
}

export const RouterAdapter: FC<PropsWithChildren> = ({ children }) => {
	const router = useRouter();

	return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
};
