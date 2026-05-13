"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../../primitives/button";
import type { SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { SetPlanFormDialog } from "./set-plan-form-dialog";

type Props = {
	exerciseName: string;
	index: number;
	weightUnit: WeightUnit;
	weightStep: number;
	current: SetPlanWithParams;
	onChange: (payload: SetPlanWithParams) => void;
};

export const SetPlanEditDialog: FC<Props> = ({
	exerciseName,
	index,
	weightUnit,
	weightStep,
	current,
	onChange,
}) => {
	const setName = `${exerciseName} ${index + 1}セット目`;
	return (
		<SetPlanFormDialog
			title={setName}
			trigger={
				<Button intent="plain" size="sq-xs" aria-label={`${setName}を編集`}>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			}
			initial={current}
			weightUnit={weightUnit}
			weightStep={weightStep}
			onSubmit={onChange}
		/>
	);
};
