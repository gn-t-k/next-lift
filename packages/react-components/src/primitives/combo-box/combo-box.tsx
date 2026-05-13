"use client";

import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import {
	Button as ButtonPrimitive,
	ComboBox as ComboBoxPrimitive,
	type ComboBoxProps as ComboBoxPrimitiveProps,
	FieldError as FieldErrorPrimitive,
	type FieldErrorProps,
	Group,
	Input as InputPrimitive,
	type InputProps,
	Label as LabelPrimitive,
	type LabelProps,
	ListBox,
	ListBoxItem as ListBoxItemPrimitive,
	type ListBoxItemProps,
	type ListBoxProps,
	Popover,
	type PopoverProps,
	Text,
	type TextProps,
} from "react-aria-components";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";

export const ComboBox = <T extends object>({
	className,
	...props
}: ComboBoxPrimitiveProps<T>) => (
	<ComboBoxPrimitive
		data-slot="control"
		className={cx(
			"w-full",
			"[&>[data-slot=label]+[data-slot=control]]:mt-2",
			"[&>[data-slot=label]+[slot='description']]:mt-1",
			"[&>[slot=description]+[data-slot=control]]:mt-2",
			"[&>[data-slot=control]+[slot=description]]:mt-2",
			"[&>[data-slot=control]+[role=alert]]:mt-2",
			"in-disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);

export const ComboBoxLabel: FC<LabelProps> = ({ className, ...props }) => (
	<LabelPrimitive
		data-slot="label"
		className={cn(
			"block select-none font-medium text-base/6 text-fg sm:text-sm/6",
			"in-data-[required=true]:after:ml-1.5 in-data-[required=true]:after:text-danger-subtle-fg in-data-[required=true]:after:content-['*']",
			"in-disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);

export const ComboBoxInput: FC<InputProps> = ({ className, ...props }) => (
	<Group
		data-slot="control"
		className={cn(
			"flex w-full overflow-hidden rounded-lg border border-border bg-overlay",
			"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
			"data-invalid:border-danger",
			"data-disabled:opacity-50",
		)}
	>
		<InputPrimitive
			className={cx(
				"block min-h-10 min-w-0 flex-1 bg-transparent px-3 py-2 text-base/6 text-fg outline-none",
				"placeholder:text-muted-fg",
				"disabled:opacity-50",
				"sm:min-h-9 sm:text-sm/6",
				className,
			)}
			{...props}
		/>
		<ButtonPrimitive
			className={cn(
				"flex min-h-10 min-w-10 shrink-0 items-center justify-center text-muted-fg",
				"border-border border-l",
				"hover:enabled:bg-secondary hover:enabled:text-fg",
				"pressed:bg-secondary pressed:text-fg",
				"focus-visible:outline-none",
				"disabled:opacity-50",
				"sm:min-h-9 sm:min-w-9",
			)}
			aria-label="候補を表示"
		>
			<ChevronUpDownIcon className="size-4" aria-hidden />
		</ButtonPrimitive>
	</Group>
);

type ComboBoxListProps<T> = Omit<ListBoxProps<T>, "layout" | "orientation"> &
	Pick<PopoverProps, "placement" | "offset">;

export const ComboBoxList = <T extends object>({
	className,
	placement,
	offset = 4,
	...props
}: ComboBoxListProps<T>) => (
	<Popover
		className={cn(
			"min-w-(--trigger-width) origin-(--trigger-anchor-point)",
			"max-h-72 overflow-hidden",
			"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
			"entering:fade-in entering:animate-in entering:duration-150",
			"exiting:fade-out exiting:animate-out exiting:duration-100",
		)}
		offset={offset}
		{...(placement !== undefined ? { placement } : {})}
	>
		<ListBox
			className={cx(
				"flex h-full flex-col gap-px overflow-y-auto overscroll-contain p-1 outline-hidden",
				className,
			)}
			{...props}
		/>
	</Popover>
);

export const ComboBoxItem = <T extends object>({
	className,
	...props
}: ListBoxItemProps<T>) => (
	<ListBoxItemPrimitive
		className={cx(
			"relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-base/6 text-fg outline-none",
			"data-hovered:bg-accent data-hovered:text-accent-fg",
			"data-focused:bg-accent data-focused:text-accent-fg",
			"data-selected:bg-accent/60 data-selected:text-accent-fg",
			"data-disabled:pointer-events-none data-disabled:opacity-50",
			"sm:px-2.5 sm:py-1.5 sm:text-sm/6",
			className,
		)}
		{...props}
	/>
);

export const ComboBoxDescription: FC<TextProps> = ({ className, ...props }) => (
	<Text
		slot="description"
		className={cn(
			"block text-base/6 text-muted-fg in-disabled:opacity-50 sm:text-sm/6",
			className,
		)}
		{...props}
	/>
);

export const ComboBoxError: FC<FieldErrorProps> = ({ className, ...props }) => (
	<FieldErrorPrimitive
		className={cx(
			"block text-base/6 text-danger-subtle-fg in-disabled:opacity-50 sm:text-sm/6 forced-colors:text-[Mark]",
			className,
		)}
		{...props}
	/>
);
