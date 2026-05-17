"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { Button } from "react-aria-components";
import { cx } from "../../libs/primitive";
import { createAffordanceClass } from "../../primitives/create-affordance";

type Props = {
	onAdd: () => void;
};

export const CreateExercisePlanCard: FC<Props> = ({ onAdd }) => {
	return (
		<Button
			onPress={onAdd}
			className={cx(
				createAffordanceClass,
				"flex w-full items-center justify-center gap-2 rounded-lg p-4",
			)}
		>
			<PlusIcon className="size-4" />
			<span className="font-medium text-sm">種目計画を追加</span>
		</Button>
	);
};
