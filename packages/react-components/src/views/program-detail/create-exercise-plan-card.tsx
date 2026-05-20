"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import { Button } from "react-aria-components";
import { cn } from "../../libs/utils";
import { createAffordanceClass } from "../../primitives/create-affordance";

type Props = {
	onAddExercisePlan: () => void;
};

export const CreateExercisePlanCard: FC<Props> = ({ onAddExercisePlan }) => {
	return (
		<Button
			onPress={onAddExercisePlan}
			className={cn(
				createAffordanceClass,
				"flex w-full items-center justify-center gap-2 rounded-lg p-4",
			)}
		>
			<PlusIcon className="size-4" />
			<span className="font-medium text-sm">種目計画を追加</span>
		</Button>
	);
};
