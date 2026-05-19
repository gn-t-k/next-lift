"use client";

import type { FC } from "react";
import {
	MenuItem as MenuItemPrimitive,
	type MenuItemProps as MenuItemPrimitiveProps,
	Menu as MenuPrimitive,
	type MenuProps as MenuPrimitiveProps,
	MenuTrigger as MenuTriggerPrimitive,
	type PopoverProps,
	Separator,
	type SeparatorProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";
import { PopoverContent } from "../popover";

export const MenuTrigger = MenuTriggerPrimitive;

type MenuProps<T> = MenuPrimitiveProps<T> &
	Pick<PopoverProps, "placement" | "offset">;

export const Menu = <T extends object>({
	className,
	placement,
	offset = 4,
	...props
}: MenuProps<T>) => (
	<PopoverContent
		className="min-w-(--trigger-width) max-w-xs origin-(--trigger-anchor-point)"
		offset={offset}
		{...(placement !== undefined ? { placement } : {})}
	>
		<MenuPrimitive
			className={cx(
				"flex max-h-[inherit] flex-col gap-px overflow-y-auto overscroll-contain p-1 outline-hidden",
				className,
			)}
			{...props}
		/>
	</PopoverContent>
);

const menuItemStyles = tv({
	base: [
		"relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-base/6 text-fg outline-none",
		"data-hovered:bg-accent data-hovered:text-accent-fg",
		"data-focused:bg-accent data-focused:text-accent-fg",
		"data-disabled:pointer-events-none data-disabled:opacity-50",
		"sm:px-2.5 sm:py-1.5 sm:text-sm/6",
		"forced-colors:data-focused:bg-[Highlight] forced-colors:data-focused:text-[HighlightText]",
	],
	variants: {
		intent: {
			danger: [
				"text-danger-subtle-fg",
				"data-hovered:bg-danger-subtle data-hovered:text-danger-subtle-fg",
				"data-focused:bg-danger-subtle data-focused:text-danger-subtle-fg",
				"forced-colors:data-focused:text-[Mark]",
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

export const MenuSeparator: FC<Omit<SeparatorProps, "orientation">> = ({
	className,
	...props
}) => (
	<Separator
		orientation="horizontal"
		className={cn("-mx-1 my-1 h-px bg-border", className)}
		{...props}
	/>
);
