"use client";

import { Link } from "@next-lift/react-components/ui";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { FC } from "react";

type NavItem = {
	href: Route;
	label: string;
	priority: "A" | "B" | "C";
};

const navItems: NavItem[] = [
	{
		href: "/cache-demo/01-basic-use-cache",
		label: "01. 基本的な use cache",
		priority: "A",
	},
	{
		href: "/cache-demo/02-cache-life",
		label: "02. cacheLife()",
		priority: "A",
	},
	{
		href: "/cache-demo/03-suspense-boundaries",
		label: "03. Suspense境界",
		priority: "A",
	},
	{
		href: "/cache-demo/04-cache-tags",
		label: "04. cacheTag()再検証",
		priority: "B",
	},
	{
		href: "/cache-demo/05-private-cache",
		label: "05. プライベートキャッシュ",
		priority: "B",
	},
	{
		href: "/cache-demo/06-connection",
		label: "06. connection()",
		priority: "B",
	},
	{
		href: "/cache-demo/07-static-params",
		label: "07. generateStaticParams",
		priority: "C",
	},
	{
		href: "/cache-demo/08-nested-cache",
		label: "08. ネストキャッシュ",
		priority: "C",
	},
	{
		href: "/cache-demo/09-route-handlers",
		label: "09. Route Handlers",
		priority: "C",
	},
	{
		href: "/cache-demo/10-interleaving",
		label: "10. Interleaving",
		priority: "C",
	},
];

export const GlobalNavigation: FC = () => {
	const currentPathname = usePathname();

	return (
		<nav className="flex-1 overflow-y-auto px-3 py-4">
			<ul className="space-y-1">
				{navItems.map((item) => {
					const isActive = currentPathname === item.href;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								className={
									isActive
										? "flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-primary-fg text-sm transition-colors"
										: "flex items-center gap-2 rounded-md px-3 py-2 text-muted-fg text-sm transition-colors hover:bg-secondary hover:text-fg"
								}
							>
								<span className="flex-1">{item.label}</span>
								<span
									className={
										isActive
											? "text-primary-fg/80 text-xs"
											: "text-muted-fg/60 text-xs"
									}
								>
									{item.priority}
								</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};
