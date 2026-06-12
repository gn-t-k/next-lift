"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { Button } from "../../primitives/button";
import type { OnSelectRoot } from "./breadcrumb-jump-sheet";
import { BreadcrumbJumpSheet } from "./breadcrumb-jump-sheet";
import type { OnChangeDayInfo, OnDeleteDay } from "./day-header-actions";
import { DayHeaderActions } from "./day-header-actions";
import type { Day, OnAddDay, OnSelectDay } from "./day-list";
import { DayList } from "./day-list";
import {
	DrilldownPlanPanel,
	DrilldownPlanPanelError,
	DrilldownPlanPanelLoading,
} from "./drilldown-plan-panel";
import { DrilldownTransition } from "./drilldown-transition";
import type {
	OnChangeExercisePlanInfo,
	OnDeleteExercisePlan,
} from "./exercise-plan-header-actions";
import { ExercisePlanHeaderActions } from "./exercise-plan-header-actions";
import type {
	ExercisePlan,
	OnAddExercisePlanWithNewExercise,
	OnAddExercisePlanWithSelectedExercise,
	OnSelectExercisePlan,
	RegisteredExercise,
	RenderWorkoutHistory,
} from "./exercise-plan-list";
import { ExercisePlanList } from "./exercise-plan-list";
import type { OnChangeProgramInfo } from "./program-info-dialog-button";
import { ProgramInfoDialogButton } from "./program-info-dialog-button";
import type {
	OnAddSetPlan,
	OnChangeSetPlan,
	OnDeleteSetPlan,
	RenderExerciseProgress,
} from "./set-plan-list";
import { SetPlanList } from "./set-plan-list";
import type { UseProgramPlanSelectionState } from "./use-program-plan-selection";

type Props = {
	programName: string;
	programMeta: string | undefined;
	days: Day[];
	registeredExercises: RegisteredExercise[];
	state: UseProgramPlanSelectionState;
	onSelectDay: OnSelectDay;
	onSelectExercisePlan: OnSelectExercisePlan;
	onSelectRoot: OnSelectRoot;
	onAddDay: OnAddDay;
	onDeleteDay: OnDeleteDay;
	onChangeDayInfo: OnChangeDayInfo;
	onChangeProgramInfo: OnChangeProgramInfo;
	onAddExercisePlanWithSelectedExercise: OnAddExercisePlanWithSelectedExercise;
	onAddExercisePlanWithNewExercise: OnAddExercisePlanWithNewExercise;
	onChangeExercisePlanInfo: OnChangeExercisePlanInfo;
	onDeleteExercisePlan: OnDeleteExercisePlan;
	onChangeSetPlan: OnChangeSetPlan;
	onAddSetPlan: OnAddSetPlan;
	onDeleteSetPlan: OnDeleteSetPlan;
	renderWorkoutHistory: RenderWorkoutHistory;
	renderExerciseProgress: RenderExerciseProgress;
};

type DrilldownState =
	| { level: "day" }
	| { level: "exercise"; day: Day }
	| { level: "set"; day: Day; exercisePlan: ExercisePlan };

export const DrilldownPanel: FC<Props> = ({
	programName,
	programMeta,
	days,
	registeredExercises,
	state,
	onSelectDay,
	onSelectExercisePlan,
	onSelectRoot,
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
	const drilldownState = resolveDrilldownState(days, state);
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
			<DrilldownPlanPanel
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
			>
				<DrilldownTransition days={days} state={state}>
					<DrilldownBody
						drilldownState={drilldownState}
						selectionState={state}
						days={days}
						registeredExercises={registeredExercises}
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
			</DrilldownPlanPanel>
			<div className="fixed inset-x-3 bottom-3 z-30">
				<BreadcrumbJumpSheet
					programName={programName}
					days={days}
					state={state}
					onSelectRoot={onSelectRoot}
					onSelectDay={onSelectDay}
					onSelectExercisePlan={onSelectExercisePlan}
				/>
			</div>
		</div>
	);
};

export const DrilldownPanelLoading: FC = () => <DrilldownPlanPanelLoading />;

type DrilldownPanelErrorProps = {
	message?: ReactNode;
};

export const DrilldownPanelError: FC<DrilldownPanelErrorProps> = ({
	message,
}) => <DrilldownPlanPanelError message={message} />;

type DrilldownBodyProps = Pick<
	Props,
	| "days"
	| "registeredExercises"
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
	drilldownState: DrilldownState;
	selectionState: UseProgramPlanSelectionState;
};

const DrilldownBody: FC<DrilldownBodyProps> = ({
	drilldownState,
	selectionState,
	days,
	registeredExercises,
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
	switch (drilldownState.level) {
		case "day":
			return (
				<DayList
					days={days}
					state={selectionState}
					onSelectDay={onSelectDay}
					onAddDay={onAddDay}
				/>
			);
		case "exercise":
			return (
				<ExercisePlanList
					day={drilldownState.day}
					registeredExercises={registeredExercises}
					state={selectionState}
					onSelectExercisePlan={onSelectExercisePlan}
					onAddExercisePlanWithSelectedExercise={
						onAddExercisePlanWithSelectedExercise
					}
					onAddExercisePlanWithNewExercise={onAddExercisePlanWithNewExercise}
					workoutHistory={renderWorkoutHistory(drilldownState.day)}
				/>
			);
		case "set":
			return (
				<SetPlanList
					exercisePlan={drilldownState.exercisePlan}
					onChangeSetPlan={onChangeSetPlan}
					onAddSetPlan={onAddSetPlan}
					onDeleteSetPlan={onDeleteSetPlan}
					exerciseProgress={renderExerciseProgress(drilldownState.exercisePlan)}
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

const resolveDrilldownState = (
	days: Day[],
	selectionState: UseProgramPlanSelectionState,
): DrilldownState => {
	switch (selectionState.level) {
		case "root":
			return { level: "day" };
		case "day": {
			const day = days.find(
				(candidate) => candidate.id === selectionState.dayId,
			);
			if (day === undefined) {
				return { level: "day" };
			}
			return { level: "exercise", day };
		}
		case "exercisePlan": {
			const day = days.find(
				(candidate) => candidate.id === selectionState.dayId,
			);
			const exercisePlan = day?.exercisePlans.find(
				(candidate) => candidate.id === selectionState.exercisePlanId,
			);
			if (day === undefined || exercisePlan === undefined) {
				return day === undefined
					? { level: "day" }
					: { level: "exercise", day };
			}
			return { level: "set", day, exercisePlan };
		}
	}
};

const formatDrilldownTitle = (
	state: DrilldownState,
	programName: string,
): string => {
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
			return state.day.meta;
		case "set":
			return state.exercisePlan.meta;
	}
};

const formatCompactDayLabel = (label: string): string =>
	label.replace(/^Day\s*\d+\s*:\s*/u, "");
