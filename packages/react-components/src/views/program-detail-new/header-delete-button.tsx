"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../primitives/button";

type Props = {
	label: string;
	onDelete: () => void;
};

export const HeaderDeleteButton: FC<Props> = ({ label, onDelete }) => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label={label}
		onPress={onDelete}
		className="shrink-0"
	>
		<TrashIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);
