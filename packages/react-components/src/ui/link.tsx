"use client";

import type { FC } from "react";
import { Link as AriaLink, type LinkProps } from "react-aria-components";

type Props = Omit<LinkProps, "href"> & {
	href?: ExtractHref<LinkConfig>;
};
/**
 * biome-ignore lint/suspicious/noEmptyInterface: 利用側でLinkのhrefの型を上書きできるようにするため（Module Augmentation）
 * @example Next.jsのtypedRoutes
 * import type { Route } from "next";
 * declare module "@next-lift/react-components/ui" {
 * 	interface LinkConfig {
 * 		href: Route;
 * 	}
 * }
 */
export interface LinkConfig {}
type ExtractHref<T> = T extends { href: infer U } ? U : string;

export const Link: FC<Props> = (props) => {
	return <AriaLink {...props} />;
};
