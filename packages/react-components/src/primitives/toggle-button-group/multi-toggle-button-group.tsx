"use client";

import type { FC } from "react";
import {
	type Key,
	ToggleButtonGroup as ToggleButtonGroupPrimitive,
	type ToggleButtonGroupProps,
} from "react-aria-components";

type Props = Omit<
	ToggleButtonGroupProps,
	"selectionMode" | "selectedKeys" | "defaultSelectedKeys" | "onSelectionChange"
> & {
	selectedKeys?: Iterable<Key>;
	defaultSelectedKeys?: Iterable<Key>;
	onSelectionChange?: (keys: Set<Key>) => void;
};

export const MultiToggleButtonGroup: FC<Props> = ({
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
