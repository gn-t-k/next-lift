"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { ComponentProps, FC, ReactNode } from "react";
import { Button } from "../../primitives/button";
import { BreadcrumbJumpSheet } from "./breadcrumb-jump-sheet";
import { DayHeaderActions } from "./day-header-actions";
import { DayList } from "./day-list";
import { DrilldownTransition } from "./drilldown-transition";
import { ExercisePlanHeaderActions } from "./exercise-plan-header-actions";
import { ExercisePlanList } from "./exercise-plan-list";
import { PlanColumn } from "./plan-column";
import { ProgramInfoDialogButton } from "./program-info-dialog-button";
import type { ProgramPlanNavigation } from "./program-plan-navigation";
import { SetPlanList } from "./set-plan-list";

type Props = ComponentProps<typeof ProgramPlanNavigation>;
type Day = NonNullable<Props["selectedDay"]>;
type ExercisePlan = NonNullable<Props["selectedExercisePlan"]>;

type DrilldownState =
	| { level: "day" }
	| { level: "exercise"; day: Day }
	| { level: "set"; day: Day; exercisePlan: ExercisePlan };

export const DrilldownPanel: FC<Props> = ({
	programName,
	programMeta,
	days,
	registeredExercises,
	selection,
	selectedDay,
	selectedExercisePlan,
	currentTarget,
	onSelectDay,
	onSelectExercisePlan,
	onSelectRoot,
	onSelectTarget,
	onAddDay,
	onDeleteDay,
	onChangeDayInfo,
	onChangeProgramInfo,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	renderWorkoutHistory,
	renderExerciseProgress,
}) => {
	const drilldownState = resolveDrilldownState({
		selectedDay,
		selectedExercisePlan,
	});
	const title = formatDrilldownTitle(drilldownState, programName);
	const meta = formatDrilldownMeta(drilldownState, programMeta);
	const leading =
		drilldownState.level === "day" ? undefined : (
			<DrilldownBackButton
				state={drilldownState}
				onSelectRoot={onSelectRoot}
				onSelectDay={onSelectDay}
			/>
		);

	return (
		<div className="relative flex flex-col gap-3 pb-16">
			<PlanColumn
				title={title}
				meta={meta}
				leading={leading}
				actions={
					<DrilldownActions
						state={drilldownState}
						programName={programName}
						programMeta={programMeta}
						onChangeProgramInfo={onChangeProgramInfo}
						onChangeDayInfo={onChangeDayInfo}
						onDeleteDay={onDeleteDay}
						onChangeExercisePlanInfo={onChangeExercisePlanInfo}
						onDeleteExercisePlan={onDeleteExercisePlan}
					/>
				}
				className="min-h-[30rem]"
				variant="plain"
			>
				<DrilldownTransition days={days} target={currentTarget}>
					<DrilldownBody
						state={drilldownState}
						days={days}
						registeredExercises={registeredExercises}
						selection={selection}
						onSelectDay={onSelectDay}
						onSelectExercisePlan={onSelectExercisePlan}
						onAddDay={onAddDay}
						onChangeSetPlan={onChangeSetPlan}
						onAddSetPlan={onAddSetPlan}
						onDeleteSetPlan={onDeleteSetPlan}
						onAddExercisePlanWithSelectedExercise={
							onAddExercisePlanWithSelectedExercise
						}
						onAddExercisePlanWithNewExercise={onAddExercisePlanWithNewExercise}
						renderWorkoutHistory={renderWorkoutHistory}
						renderExerciseProgress={renderExerciseProgress}
					/>
				</DrilldownTransition>
			</PlanColumn>
			<div className="fixed inset-x-3 bottom-3 z-30">
				<BreadcrumbJumpSheet
					programName={programName}
					days={days}
					selectedDay={selectedDay}
					selectedExercisePlan={selectedExercisePlan}
					currentTarget={currentTarget}
					onSelectRoot={onSelectRoot}
					onSelectTarget={onSelectTarget}
				/>
			</div>
		</div>
	);
};

type DrilldownBodyProps = Pick<
	Props,
	| "days"
	| "registeredExercises"
	| "selection"
	| "onSelectDay"
	| "onSelectExercisePlan"
	| "onAddDay"
	| "onChangeSetPlan"
	| "onAddSetPlan"
	| "onDeleteSetPlan"
	| "onAddExercisePlanWithSelectedExercise"
	| "onAddExercisePlanWithNewExercise"
	| "renderWorkoutHistory"
	| "renderExerciseProgress"
> & {
	state: DrilldownState;
};

const DrilldownBody: FC<DrilldownBodyProps> = ({
	state,
	days,
	registeredExercises,
	selection,
	onSelectDay,
	onSelectExercisePlan,
	onAddDay,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	renderWorkoutHistory,
	renderExerciseProgress,
}) => {
	switch (state.level) {
		case "day":
			return (
				<DayList
					days={days}
					selectedDayId={selection.dayId}
					onSelectDay={onSelectDay}
					onAddDay={onAddDay}
				/>
			);
		case "exercise":
			return (
				<ExercisePlanList
					day={state.day}
					registeredExercises={registeredExercises}
					selectedExercisePlanId={selection.exercisePlanId}
					onSelectExercisePlan={onSelectExercisePlan}
					onAddExercisePlanWithSelectedExercise={
						onAddExercisePlanWithSelectedExercise
					}
					onAddExercisePlanWithNewExercise={onAddExercisePlanWithNewExercise}
					workoutHistory={renderWorkoutHistory(state.day)}
				/>
			);
		case "set":
			return (
				<SetPlanList
					exercisePlan={state.exercisePlan}
					onChangeSetPlan={onChangeSetPlan}
					onAddSetPlan={onAddSetPlan}
					onDeleteSetPlan={onDeleteSetPlan}
					exerciseProgress={renderExerciseProgress(state.exercisePlan)}
				/>
			);
	}
};

type DrilldownActionsProps = Pick<
	Props,
	| "programName"
	| "programMeta"
	| "onChangeProgramInfo"
	| "onChangeDayInfo"
	| "onDeleteDay"
	| "onChangeExercisePlanInfo"
	| "onDeleteExercisePlan"
> & {
	state: DrilldownState;
};

const DrilldownActions: FC<DrilldownActionsProps> = ({
	state,
	programName,
	programMeta,
	onChangeProgramInfo,
	onChangeDayInfo,
	onDeleteDay,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
}) => {
	switch (state.level) {
		case "day":
			return (
				<ProgramInfoDialogButton
					name={programName}
					meta={programMeta}
					onChange={onChangeProgramInfo}
				/>
			);
		case "exercise":
			return (
				<DayHeaderActions
					day={state.day}
					onChangeDayInfo={onChangeDayInfo}
					onDeleteDay={onDeleteDay}
				/>
			);
		case "set":
			return (
				<ExercisePlanHeaderActions
					exercisePlan={state.exercisePlan}
					onChangeExercisePlanInfo={onChangeExercisePlanInfo}
					onDeleteExercisePlan={onDeleteExercisePlan}
				/>
			);
	}
};

type DrilldownBackButtonProps = {
	state: Exclude<DrilldownState, { level: "day" }>;
	onSelectRoot: () => void;
	onSelectDay: (dayId: string) => void;
};

const DrilldownBackButton: FC<DrilldownBackButtonProps> = ({
	state,
	onSelectRoot,
	onSelectDay,
}) => {
	const onPress =
		state.level === "exercise" ? onSelectRoot : () => onSelectDay(state.day.id);
	return (
		<Button
			intent="plain"
			size="sq-xs"
			aria-label="上の階層へ戻る"
			onPress={onPress}
		>
			<ChevronLeftIcon data-slot="icon" className="size-4" aria-hidden />
		</Button>
	);
};

const resolveDrilldownState = ({
	selectedDay,
	selectedExercisePlan,
}: Pick<Props, "selectedDay" | "selectedExercisePlan">): DrilldownState => {
	if (selectedDay === undefined) {
		return { level: "day" };
	}
	if (selectedExercisePlan === undefined) {
		return { level: "exercise", day: selectedDay };
	}
	return {
		level: "set",
		day: selectedDay,
		exercisePlan: selectedExercisePlan,
	};
};

const formatDrilldownTitle = (
	state: DrilldownState,
	programName: string,
): ReactNode => {
	switch (state.level) {
		case "day":
			return programName;
		case "exercise":
			return formatCompactDayLabel(state.day.label);
		case "set":
			return state.exercisePlan.exercise.name;
	}
};

const formatDrilldownMeta = (
	state: DrilldownState,
	programMeta: string | undefined,
): ReactNode => {
	switch (state.level) {
		case "day":
			return programMeta;
		case "exercise":
			return state.day.memo;
		case "set":
			return state.exercisePlan.memo;
	}
};

const formatCompactDayLabel = (label: string): string =>
	label.replace(/^Day\s*\d+\s*:\s*/u, "");
