"use client";

import type { FC } from "react";
import {
	FieldError as FieldErrorPrimitive,
	type FieldErrorProps,
	Input as InputPrimitive,
	type InputProps,
	Text,
	TextField as TextFieldPrimitive,
	type TextFieldProps as TextFieldPrimitiveProps,
	type TextProps,
} from "react-aria-components";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";

export const TextField: FC<TextFieldPrimitiveProps> = ({
	className,
	...props
}) => (
	<TextFieldPrimitive
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

export const TextFieldInput: FC<InputProps> = ({ className, ...props }) => (
	<InputPrimitive
		data-slot="control"
		className={cx(
			"block min-h-10 w-full rounded-lg border border-border bg-overlay px-3 py-2 text-base/6 text-fg outline-none",
			"placeholder:text-muted-fg",
			"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
			"invalid:border-danger",
			"disabled:opacity-50",
			"sm:min-h-9 sm:text-sm/6",
			className,
		)}
		{...props}
	/>
);

export const TextFieldDescription: FC<TextProps> = ({
	className,
	...props
}) => (
	<Text
		slot="description"
		className={cn(
			"block text-base/6 text-muted-fg in-disabled:opacity-50 sm:text-sm/6",
			className,
		)}
		{...props}
	/>
);

export const TextFieldError: FC<FieldErrorProps> = ({
	className,
	...props
}) => (
	<FieldErrorPrimitive
		className={cx(
			"block text-base/6 text-danger-subtle-fg in-disabled:opacity-50 sm:text-sm/6 forced-colors:text-[Mark]",
			className,
		)}
		{...props}
	/>
);
