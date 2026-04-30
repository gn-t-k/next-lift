"use client";

import type { FC } from "react";
import {
	FieldError as FieldErrorPrimitive,
	type FieldErrorProps,
	Input as InputPrimitive,
	type InputProps,
	Label as LabelPrimitive,
	type LabelProps,
	Text,
	TextField as TextFieldPrimitive,
	type TextFieldProps as TextFieldPrimitiveProps,
	type TextProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";

export const TextField: FC<TextFieldPrimitiveProps> = ({
	className,
	...props
}) => (
	<TextFieldPrimitive
		data-slot="control"
		className={cx(fieldStyles(), className)}
		{...props}
	/>
);

export const TextFieldLabel: FC<LabelProps> = ({ className, ...props }) => (
	<LabelPrimitive
		data-slot="label"
		className={cn(labelStyles(), className)}
		{...props}
	/>
);

export const TextFieldInput: FC<InputProps> = ({ className, ...props }) => (
	<InputPrimitive
		data-slot="control"
		className={cx(inputStyles(), className)}
		{...props}
	/>
);

export const TextFieldDescription: FC<TextProps> = ({
	className,
	...props
}) => (
	<Text
		slot="description"
		className={cn(descriptionStyles(), className)}
		{...props}
	/>
);

export const TextFieldError: FC<FieldErrorProps> = ({
	className,
	...props
}) => (
	<FieldErrorPrimitive
		className={cx(fieldErrorStyles(), className)}
		{...props}
	/>
);

const fieldStyles = tv({
	base: [
		"w-full",
		"[&>[data-slot=label]+[data-slot=control]]:mt-2",
		"[&>[data-slot=label]+[slot='description']]:mt-1",
		"[&>[slot=description]+[data-slot=control]]:mt-2",
		"[&>[data-slot=control]+[slot=description]]:mt-2",
		"[&>[data-slot=control]+[role=alert]]:mt-2",
		"in-disabled:opacity-50",
	],
});

const labelStyles = tv({
	base: [
		"block select-none font-medium text-base/6 text-fg sm:text-sm/6",
		"in-data-[required=true]:after:ml-1.5 in-data-[required=true]:after:text-danger-subtle-fg in-data-[required=true]:after:content-['*']",
		"in-disabled:opacity-50",
	],
});

const inputStyles = tv({
	base: [
		"block min-h-10 w-full rounded-lg border border-border bg-overlay px-3 py-2 text-base/6 text-fg outline-none",
		"placeholder:text-muted-fg",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
		"invalid:border-danger",
		"disabled:opacity-50",
		"sm:min-h-9 sm:text-sm/6",
	],
});

const descriptionStyles = tv({
	base: "block text-base/6 text-muted-fg in-disabled:opacity-50 sm:text-sm/6",
});

const fieldErrorStyles = tv({
	base: "block text-base/6 text-danger-subtle-fg in-disabled:opacity-50 sm:text-sm/6 forced-colors:text-[Mark]",
});
