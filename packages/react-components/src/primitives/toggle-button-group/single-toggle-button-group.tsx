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
	selectedKey?: Key | null;
	defaultSelectedKey?: Key;
	onSelectionChange?: (key: Key | null) => void;
};

export const SingleToggleButtonGroup: FC<Props> = ({
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
