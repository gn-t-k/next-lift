"use client";

import type { FC } from "react";
import {
	MenuItem as MenuItemPrimitive,
	type MenuItemProps as MenuItemPrimitiveProps,
	Menu as MenuPrimitive,
	type MenuProps as MenuPrimitiveProps,
	MenuTrigger as MenuTriggerPrimitive,
	Popover,
	type PopoverProps,
	Separator,
	type SeparatorProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";

export const MenuTrigger = MenuTriggerPrimitive;

const popoverClass = [
	"min-w-(--trigger-width) max-w-xs origin-(--trigger-anchor-point)",
	"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
	"entering:fade-in entering:animate-in entering:duration-150",
	"exiting:fade-out exiting:animate-out exiting:duration-100",
].join(" ");

const menuClass =
	"flex max-h-[inherit] flex-col gap-px overflow-y-auto overscroll-contain p-1 outline-hidden";

type MenuProps<T> = MenuPrimitiveProps<T> &
	Pick<PopoverProps, "placement" | "offset">;

export const Menu = <T extends object>({
	className,
	placement,
	offset = 4,
	...props
}: MenuProps<T>) => (
	<Popover
		className={cx(popoverClass)}
		offset={offset}
		{...(placement !== undefined ? { placement } : {})}
	>
		<MenuPrimitive className={cx(menuClass, className)} {...props} />
	</Popover>
);

const menuItemStyles = tv({
	base: [
		"relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-base/6 text-fg outline-none",
		"data-[hovered]:bg-accent data-[hovered]:text-accent-fg",
		"data-[focused]:bg-accent data-[focused]:text-accent-fg",
		"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		"sm:px-2.5 sm:py-1.5 sm:text-sm/6",
		"forced-colors:data-[focused]:bg-[Highlight] forced-colors:data-[focused]:text-[HighlightText]",
	],
	variants: {
		intent: {
			danger: [
				"text-danger-subtle-fg",
				"data-[hovered]:bg-danger-subtle data-[hovered]:text-danger-subtle-fg",
				"data-[focused]:bg-danger-subtle data-[focused]:text-danger-subtle-fg",
				"forced-colors:data-[focused]:text-[Mark]",
			],
		},
	},
});

type MenuItemProps = MenuItemPrimitiveProps &
	VariantProps<typeof menuItemStyles>;

export const MenuItem: FC<MenuItemProps> = ({
	className,
	intent,
	...props
}) => (
	<MenuItemPrimitive
		className={cx(menuItemStyles({ intent }), className)}
		{...props}
	/>
);

const menuSeparatorClass = "-mx-1 my-1 h-px bg-border";

export const MenuSeparator: FC<Omit<SeparatorProps, "orientation">> = ({
	className,
	...props
}) => (
	<Separator
		orientation="horizontal"
		className={cn(menuSeparatorClass, className)}
		{...props}
	/>
);
