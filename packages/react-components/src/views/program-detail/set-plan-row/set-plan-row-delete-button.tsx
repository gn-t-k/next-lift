"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../../primitives/button";

type Props = {
	label: string;
	onPress: () => void;
};

export const SetPlanRowDeleteButton: FC<Props> = ({ label, onPress }) => (
	<Button intent="plain" size="sq-xs" aria-label={label} onPress={onPress}>
		<TrashIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);
