"use client";

import type { FC } from "react";
import {
	TabList as TabListPrimitive,
	type TabListProps as TabListPrimitiveProps,
	TabPanel as TabPanelPrimitive,
	type TabPanelProps as TabPanelPrimitiveProps,
	Tab as TabPrimitive,
	type TabProps as TabPrimitiveProps,
	Tabs as TabsPrimitive,
	type TabsProps as TabsPrimitiveProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { cx } from "../../libs/primitive";

export const Tabs: FC<TabsPrimitiveProps> = ({ className, ...props }) => (
	<TabsPrimitive
		data-slot="tabs"
		className={cx(tabsStyles(), className)}
		{...props}
	/>
);

export const TabList: FC<TabListPrimitiveProps<object>> = ({
	className,
	...props
}) => (
	<TabListPrimitive
		data-slot="tab-list"
		className={cx(tabListStyles(), className)}
		{...props}
	/>
);

export const Tab: FC<TabPrimitiveProps> = ({ className, ...props }) => (
	<TabPrimitive
		data-slot="tab"
		className={cx(tabStyles(), className)}
		{...props}
	/>
);

export const TabPanel: FC<TabPanelPrimitiveProps> = ({
	className,
	...props
}) => (
	<TabPanelPrimitive
		data-slot="tab-panel"
		className={cx(tabPanelStyles(), className)}
		{...props}
	/>
);

const tabsStyles = tv({
	base: [
		"flex flex-col gap-4",
		"orientation-vertical:flex-row orientation-vertical:gap-6",
	],
});

const tabListStyles = tv({
	base: [
		"relative flex forced-color-adjust-none",
		"orientation-horizontal:flex-row orientation-horizontal:gap-x-1 orientation-horizontal:border-border orientation-horizontal:border-b",
		"orientation-vertical:min-w-48 orientation-vertical:shrink-0 orientation-vertical:flex-col orientation-vertical:gap-y-1 orientation-vertical:border-border orientation-vertical:border-l",
	],
});

const tabStyles = tv({
	base: [
		"relative inline-flex cursor-default items-center whitespace-nowrap rounded-md font-medium text-base/6 text-muted-fg outline-hidden transition-colors sm:text-sm/6",
		"px-3 py-1.5",
		"hover:bg-secondary hover:text-fg",
		"selected:text-primary-subtle-fg selected:hover:bg-primary-subtle selected:hover:text-primary-subtle-fg",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
		"disabled:opacity-50",
		"after:pointer-events-none after:absolute after:bg-transparent",
		"orientation-horizontal:after:inset-x-0 orientation-horizontal:after:-bottom-px orientation-horizontal:after:h-0.5 orientation-horizontal:selected:after:bg-primary-subtle-fg",
		"orientation-vertical:w-full orientation-vertical:justify-start orientation-vertical:after:inset-y-1.5 orientation-vertical:after:-left-px orientation-vertical:after:w-0.5 orientation-vertical:selected:after:bg-primary-subtle-fg",
	],
});

const tabPanelStyles = tv({
	base: "flex-1 text-fg outline-hidden",
});
