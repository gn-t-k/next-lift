"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { ProgramInfoForm } from "../program-detail/program-info-form";
import { ProgramPlanNavigation } from "./program-plan-navigation";
import { ProgramDetailNewError, ProgramDetailNewLoading } from "./status";
import type { ProgramDetailNewProps } from "./types";
import { useProgramPlanSelection } from "./use-program-plan-selection";

export type { ProgramDetailNewProps };
export { ProgramDetailNewError, ProgramDetailNewLoading };

export const ProgramDetailNew: FC<ProgramDetailNewProps> = ({
	name,
	meta,
	days,
	availableExercises,
	defaultSelectedDayId,
	defaultSelectedExercisePlanId,
	onAddDay,
	onDeleteDay,
	onChangeDayLabel,
	onChangeDayInfo,
	onChangeProgramInfo,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	lastAddedExercisePlanId,
	renderWorkoutHistory,
	renderExerciseProgress,
}) => {
	const {
		selection,
		selectedDay,
		selectedExercisePlan,
		currentTarget,
		selectDay,
		selectExercisePlan,
		selectRoot,
		selectTarget,
	} = useProgramPlanSelection({
		days,
		defaultSelectedDayId,
		defaultSelectedExercisePlanId,
	});

	return (
		<div className="@container flex flex-col gap-6">
			<h1 className="sr-only">{name}</h1>
			<ProgramPlanNavigation
				programName={name}
				programMeta={meta}
				programActions={
					<ProgramInfoDialogButton
						name={name}
						meta={meta}
						onChange={onChangeProgramInfo}
					/>
				}
				days={days}
				availableExercises={availableExercises}
				selection={selection}
				selectedDay={selectedDay}
				selectedExercisePlan={selectedExercisePlan}
				currentTarget={currentTarget}
				lastAddedExercisePlanId={lastAddedExercisePlanId}
				onSelectDay={selectDay}
				onSelectExercisePlan={selectExercisePlan}
				onSelectRoot={selectRoot}
				onSelectTarget={selectTarget}
				onAddDay={onAddDay}
				onDeleteDay={onDeleteDay}
				onChangeDayInfo={(dayId, payload) => {
					if (onChangeDayInfo !== undefined) {
						onChangeDayInfo(dayId, payload);
						return;
					}
					onChangeDayLabel(dayId, payload.label);
				}}
				onAddExercisePlanWithSelectedExercise={
					onAddExercisePlanWithSelectedExercise
				}
				onAddExercisePlanWithNewExercise={onAddExercisePlanWithNewExercise}
				onChangeExercisePlanInfo={onChangeExercisePlanInfo}
				onDeleteExercisePlan={onDeleteExercisePlan}
				onChangeSetPlan={onChangeSetPlan}
				onAddSetPlan={onAddSetPlan}
				onDeleteSetPlan={onDeleteSetPlan}
				renderWorkoutHistory={renderWorkoutHistory}
				renderExerciseProgress={renderExerciseProgress}
			/>
		</div>
	);
};

type ProgramInfoDialogButtonProps = {
	name: string;
	meta: string | null;
	onChange: (payload: { name: string; meta: string | null }) => void;
	showLabel?: boolean | undefined;
};

const ProgramInfoDialogButton: FC<ProgramInfoDialogButtonProps> = ({
	name,
	meta,
	onChange,
	showLabel = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = "プログラム情報を編集";
	const trigger = (
		<Button
			intent="plain"
			size={showLabel ? "sm" : "sq-xs"}
			aria-label={title}
			className="shrink-0"
		>
			<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
			{showLabel ? "編集" : null}
		</Button>
	);

	return (
		<ResponsiveDialog
			title={title}
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			desktopViewport={desktopViewport}
			popoverWidth="default"
		>
			<ProgramInfoForm
				name={name}
				meta={meta}
				onCancel={() => setIsOpen(false)}
				onSubmit={(payload) => {
					onChange(payload);
					setIsOpen(false);
				}}
			/>
		</ResponsiveDialog>
	);
};
