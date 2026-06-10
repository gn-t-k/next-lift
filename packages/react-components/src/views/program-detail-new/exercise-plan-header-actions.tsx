"use client";

import type { ComponentProps, FC } from "react";
import type { ProgramDetailNew } from ".";
import { ExercisePlanMemoDialogButton } from "./exercise-plan-memo-dialog-button";
import { HeaderActions } from "./header-actions";
import { HeaderDeleteButton } from "./header-delete-button";

type ExercisePlan = ComponentProps<
	typeof ProgramDetailNew
>["days"][number]["exercisePlans"][number];

type Props = {
	exercisePlan: ExercisePlan;
	onChangeExercisePlanInfo: (
		exercisePlanId: string,
		payload: { memo: string | null },
	) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
};

export const ExercisePlanHeaderActions: FC<Props> = ({
	exercisePlan,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
}) => (
	<HeaderActions>
		<ExercisePlanMemoDialogButton
			exercisePlan={exercisePlan}
			onChange={onChangeExercisePlanInfo}
		/>
		<HeaderDeleteButton
			label={`${exercisePlan.exercise.name}の種目計画を削除`}
			onDelete={() => onDeleteExercisePlan(exercisePlan.id)}
		/>
	</HeaderActions>
);
