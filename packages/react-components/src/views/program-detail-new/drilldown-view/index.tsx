import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { Button } from "../../../primitives/button";
import type { OnSelectRoot } from "../breadcrumb-jump-sheet";
import { BreadcrumbJumpSheet } from "../breadcrumb-jump-sheet";
import type { OnChangeDayInfo, OnDeleteDay } from "../day-header-actions";
import { DayHeaderActions } from "../day-header-actions";
import type { Day, OnAddDay, OnSelectDay } from "../day-list";
import { DayList } from "../day-list";
import type {
	OnChangeExercisePlanInfo,
	OnDeleteExercisePlan,
} from "../exercise-plan-header-actions";
import { ExercisePlanHeaderActions } from "../exercise-plan-header-actions";
import type {
	OnAddExercisePlanWithNewExercise,
	OnAddExercisePlanWithSelectedExercise,
	OnSelectExercisePlan,
	RegisteredExercise,
	RenderWorkoutHistory,
} from "../exercise-plan-list";
import { ExercisePlanList } from "../exercise-plan-list";
import type { OnChangeProgramInfo } from "../program-info-dialog-button";
import { ProgramInfoDialogButton } from "../program-info-dialog-button";
import type {
	OnAddSetPlan,
	OnChangeSetPlan,
	OnDeleteSetPlan,
	RenderExerciseProgress,
} from "../set-plan-list";
import { SetPlanList } from "../set-plan-list";
import type { UseProgramPlanSelectionState } from "../use-program-plan-selection";
import { DrilldownTransition } from "./drilldown-transition";
import {
	DrilldownPanelShell,
	DrilldownPanelShellError,
	DrilldownPanelShellLoading,
} from "./panel-shell";
import {
	type DrilldownState,
	resolveDrilldownState,
} from "./resolve-drilldown-state";

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

type DrilldownPanelContent = {
	title: string | undefined;
	meta: ReactNode;
	leading: ReactNode;
	actions: ReactNode;
	body: ReactNode;
};

export const DrilldownView: FC<Props> = ({
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
	const panel = resolveDrilldownPanelContent({
		drilldownState,
		programName,
		programMeta,
		days,
		registeredExercises,
		selectionState: state,
		onSelectRoot,
		onSelectDay,
		onAddDay,
		onDeleteDay,
		onChangeDayInfo,
		onChangeProgramInfo,
		onSelectExercisePlan,
		onAddExercisePlanWithSelectedExercise,
		onAddExercisePlanWithNewExercise,
		onChangeExercisePlanInfo,
		onDeleteExercisePlan,
		onChangeSetPlan,
		onAddSetPlan,
		onDeleteSetPlan,
		renderWorkoutHistory,
		renderExerciseProgress,
	});

	return (
		<div className="relative flex flex-col gap-3 pb-16">
			<DrilldownPanelShell
				title={panel.title}
				meta={panel.meta}
				leading={panel.leading}
				actions={panel.actions}
			>
				<DrilldownTransition days={days} state={state}>
					{panel.body}
				</DrilldownTransition>
			</DrilldownPanelShell>
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

export const DrilldownViewLoading: FC = () => <DrilldownPanelShellLoading />;

type DrilldownViewErrorProps = {
	message?: ReactNode;
};

export const DrilldownViewError: FC<DrilldownViewErrorProps> = ({
	message,
}) => <DrilldownPanelShellError message={message} />;

type ResolveDrilldownPanelContentProps = Pick<
	Props,
	| "programName"
	| "programMeta"
	| "days"
	| "registeredExercises"
	| "onSelectRoot"
	| "onSelectDay"
	| "onAddDay"
	| "onDeleteDay"
	| "onChangeDayInfo"
	| "onChangeProgramInfo"
	| "onSelectExercisePlan"
	| "onAddExercisePlanWithSelectedExercise"
	| "onAddExercisePlanWithNewExercise"
	| "onChangeExercisePlanInfo"
	| "onDeleteExercisePlan"
	| "onChangeSetPlan"
	| "onAddSetPlan"
	| "onDeleteSetPlan"
	| "renderWorkoutHistory"
	| "renderExerciseProgress"
> & {
	drilldownState: DrilldownState;
	selectionState: UseProgramPlanSelectionState;
};

const resolveDrilldownPanelContent = ({
	drilldownState,
	programName,
	programMeta,
	days,
	registeredExercises,
	selectionState,
	onSelectRoot,
	onSelectDay,
	onAddDay,
	onDeleteDay,
	onChangeDayInfo,
	onChangeProgramInfo,
	onSelectExercisePlan,
	onAddExercisePlanWithSelectedExercise,
	onAddExercisePlanWithNewExercise,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
	onChangeSetPlan,
	onAddSetPlan,
	onDeleteSetPlan,
	renderWorkoutHistory,
	renderExerciseProgress,
}: ResolveDrilldownPanelContentProps): DrilldownPanelContent => {
	switch (drilldownState.level) {
		case "day":
			return {
				title: programName,
				meta: programMeta,
				leading: undefined,
				actions: (
					<ProgramInfoDialogButton
						name={programName}
						meta={programMeta}
						onChange={onChangeProgramInfo}
					/>
				),
				body: (
					<DayList
						days={days}
						state={selectionState}
						onSelectDay={onSelectDay}
						onAddDay={onAddDay}
					/>
				),
			};
		case "exercise":
			return {
				title: formatCompactDayLabel(drilldownState.day.label),
				meta: drilldownState.day.meta,
				leading: <DrilldownBackButton onPress={onSelectRoot} />,
				actions: (
					<DayHeaderActions
						day={drilldownState.day}
						onChangeDayInfo={onChangeDayInfo}
						onDeleteDay={onDeleteDay}
					/>
				),
				body: (
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
				),
			};
		case "set":
			return {
				title: drilldownState.exercisePlan.exercise.name,
				meta: drilldownState.exercisePlan.meta,
				leading: (
					<DrilldownBackButton
						onPress={() => onSelectDay(drilldownState.day.id)}
					/>
				),
				actions: (
					<ExercisePlanHeaderActions
						exercisePlan={drilldownState.exercisePlan}
						onChangeExercisePlanInfo={onChangeExercisePlanInfo}
						onDeleteExercisePlan={onDeleteExercisePlan}
					/>
				),
				body: (
					<SetPlanList
						exercisePlan={drilldownState.exercisePlan}
						onChangeSetPlan={onChangeSetPlan}
						onAddSetPlan={onAddSetPlan}
						onDeleteSetPlan={onDeleteSetPlan}
						exerciseProgress={renderExerciseProgress(
							drilldownState.exercisePlan,
						)}
					/>
				),
			};
	}
};

type DrilldownBackButtonProps = {
	onPress: () => void;
};

const DrilldownBackButton: FC<DrilldownBackButtonProps> = ({ onPress }) => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label="上の階層へ戻る"
		onPress={onPress}
	>
		<ChevronLeftIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);

const formatCompactDayLabel = (label: string): string =>
	label.replace(/^Day\s*\d+\s*:\s*/u, "");
