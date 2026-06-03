"use client";

import type { FC } from "react";
import {
	composeRenderProps,
	type Key,
	ToggleButtonGroup as ToggleButtonGroupPrimitive,
	type ToggleButtonGroupProps,
	ToggleButton as ToggleButtonPrimitive,
	type ToggleButtonProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { buttonStyles } from "../button";

type MultiProps = Omit<
	ToggleButtonGroupProps,
	"selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange"
> & {
	selectedKeys?: Iterable<Key>;
	defaultSelectedKeys?: Iterable<Key>;
	onSelectionChange?: (keys: Set<Key>) => void;
};

export const MultiToggleButtonGroup: FC<MultiProps> = ({
	selectedKeys,
	defaultSelectedKeys,
	onSelectionChange,
	...props
}) => (
	<ToggleButtonGroupPrimitive
		selectionMode="multiple"
		{...(selectedKeys !== undefined && { selectedKeys })}
		{...(defaultSelectedKeys !== undefined && { defaultSelectedKeys })}
		{...(onSelectionChange !== undefined && { onSelectionChange })}
		{...props}
	/>
);

type SingleProps = Omit<
	ToggleButtonGroupProps,
	"selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange"
> & {
	selectedKey?: Key | null;
	defaultSelectedKey?: Key;
	onSelectionChange?: (key: Key | null) => void;
};

export const SingleToggleButtonGroup: FC<SingleProps> = ({
	selectedKey,
	defaultSelectedKey,
	onSelectionChange,
	...props
}) => (
	<ToggleButtonGroupPrimitive
		selectionMode="single"
		{...(selectedKey !== undefined && {
			selectedKeys:
				selectedKey === null ? new Set<Key>() : new Set([selectedKey]),
		})}
		{...(defaultSelectedKey !== undefined && {
			defaultSelectedKeys: new Set([defaultSelectedKey]),
		})}
		{...(onSelectionChange !== undefined && {
			onSelectionChange: (keys: Set<Key>) => {
				const [first] = keys;
				onSelectionChange(first ?? null);
			},
		})}
		{...props}
	/>
);

export const ToggleButton: FC<ToggleButtonProps> = ({
	className,
	...props
}) => (
	<ToggleButtonPrimitive
		{...props}
		className={composeRenderProps(className, (cls, { isSelected }) =>
			twMerge(
				buttonStyles({
					intent: isSelected ? "primary" : "outline",
					size: "sm",
				}),
				cls,
			),
		)}
	/>
);
