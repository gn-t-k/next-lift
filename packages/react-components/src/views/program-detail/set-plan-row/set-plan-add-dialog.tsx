"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button as AriaButton } from "react-aria-components";
import { cn } from "../../../libs/utils";
import { createAffordanceClass } from "../../../primitives/create-affordance";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { SetPlanFormDialog } from "./set-plan-form-dialog";

type Props = {
	exerciseName: string;
	index: number;
	weightUnit: WeightUnit;
	weightStep: number;
	initial: SetPlanWithParams | undefined;
	onAdd: (payload: SetPlanWithParams) => void;
};

export const SetPlanAddDialog: FC<Props> = ({
	exerciseName,
	index,
	weightUnit,
	weightStep,
	initial,
	onAdd,
}) => (
	<SetPlanFormDialog
		title={`${exerciseName} ${index + 1}セット目を追加`}
		trigger={
			<AriaButton
				className={cn(
					createAffordanceClass,
					"flex flex-1 items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left",
				)}
			>
				<span className="flex-1 truncate">セットを追加</span>
				<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
			</AriaButton>
		}
		initial={initial}
		weightUnit={weightUnit}
		weightStep={weightStep}
		onSubmit={onAdd}
	/>
);
