"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import {
	Button as ButtonPrimitive,
	type ButtonProps,
	FieldError as FieldErrorPrimitive,
	type FieldErrorProps,
	Group,
	Input as InputPrimitive,
	type InputProps,
	Label as LabelPrimitive,
	type LabelProps,
	NumberField as NumberFieldPrimitive,
	type NumberFieldProps as NumberFieldPrimitiveProps,
	Text,
	type TextProps,
} from "react-aria-components";
import { cx } from "../../libs/primitive";
import { cn } from "../../libs/utils";

export const NumberField: FC<NumberFieldPrimitiveProps> = ({
	className,
	...props
}) => (
	<NumberFieldPrimitive
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

export const NumberFieldLabel: FC<LabelProps> = ({ className, ...props }) => (
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

export const NumberFieldInput: FC<InputProps> = ({ className, ...props }) => (
	<Group
		data-slot="control"
		className={cn(
			"flex w-full overflow-hidden rounded-lg border border-border bg-overlay",
			"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
			"data-invalid:border-danger",
			"data-disabled:opacity-50",
		)}
	>
		<NumberFieldStepperButton slot="decrement" aria-label="減らす">
			<MinusIcon className="size-4" aria-hidden />
		</NumberFieldStepperButton>
		<InputPrimitive
			className={cx(
				"block min-h-10 min-w-0 flex-1 bg-transparent px-3 py-2 text-center text-base/6 text-fg tabular-nums outline-none",
				"placeholder:text-muted-fg",
				"disabled:opacity-50",
				"sm:min-h-9 sm:text-sm/6",
				className,
			)}
			{...props}
		/>
		<NumberFieldStepperButton slot="increment" aria-label="増やす">
			<PlusIcon className="size-4" aria-hidden />
		</NumberFieldStepperButton>
	</Group>
);

const NumberFieldStepperButton: FC<ButtonProps> = ({ className, ...props }) => (
	<ButtonPrimitive
		className={cx(
			"flex min-h-10 min-w-10 shrink-0 items-center justify-center text-muted-fg",
			"border-border first:border-r last:border-l",
			"hover:enabled:bg-secondary hover:enabled:text-fg",
			"pressed:bg-secondary pressed:text-fg",
			"focus-visible:outline-none",
			"disabled:opacity-50",
			"sm:min-h-9 sm:min-w-9",
			className,
		)}
		{...props}
	/>
);

export const NumberFieldDescription: FC<TextProps> = ({
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

export const NumberFieldError: FC<FieldErrorProps> = ({
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
