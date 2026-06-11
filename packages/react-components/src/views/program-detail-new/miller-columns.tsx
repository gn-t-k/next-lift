import type { FC, ReactNode } from "react";
import { DayHeaderActions } from "./day-header-actions";
import type { DayInfoPayload } from "./day-info-dialog-button";
import type { Day } from "./day-list";
import { DayList } from "./day-list";
import { ExercisePlanHeaderActions } from "./exercise-plan-header-actions";
import type { ExercisePlan, RegisteredExercise } from "./exercise-plan-list";
import { ExercisePlanList } from "./exercise-plan-list";
import type { ExercisePlanMemoPayload } from "./exercise-plan-memo-dialog-button";
import { LabeledPlanColumn } from "./labeled-plan-column";
import { MissingParentState } from "./missing-parent-state";
import { PlanColumn } from "./plan-column";
import type { ProgramInfoPayload } from "./program-info-dialog-button";
import { ProgramInfoDialogButton } from "./program-info-dialog-button";
import type { SetPlanDraft } from "./set-plan-list";
import { SetPlanList } from "./set-plan-list";
import type {
	NavigationTarget,
	ProgramPlanSelection,
} from "./use-program-plan-selection";

export type ProgramPlanViewProps = {
	programName: string;
	programMeta?: string | undefined;
	days: Day[];
	registeredExercises: RegisteredExercise[];
	selection: ProgramPlanSelection;
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
	currentTarget: NavigationTarget | undefined;
	onSelectDay: (dayId: string) => void;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	onSelectRoot: () => void;
	onSelectTarget: (target: NavigationTarget) => void;
	onAddDay: () => void;
	onDeleteDay: (dayId: string) => void;
	onChangeDayInfo: (dayId: string, payload: DayInfoPayload) => void;
	onChangeProgramInfo: (payload: ProgramInfoPayload) => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	onChangeExercisePlanInfo: (
		exercisePlanId: string,
		payload: ExercisePlanMemoPayload,
	) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanDraft) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	renderWorkoutHistory: (day: Day) => ReactNode;
	renderExerciseProgress: (exercisePlan: ExercisePlan) => ReactNode;
};

type Props = ProgramPlanViewProps;

export const MillerColumns: FC<Props> = ({
	programName,
	programMeta,
	days,
	registeredExercises,
	selection,
	selectedDay,
	selectedExercisePlan,
	onSelectDay,
	onSelectExercisePlan,
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
}) => (
	<>
		<LabeledPlanColumn
			label="プログラム"
			title={programName}
			meta={programMeta}
			actions={
				<ProgramInfoDialogButton
					name={programName}
					meta={programMeta}
					onChange={onChangeProgramInfo}
				/>
			}
		>
			<PlanColumn>
				<DayList
					days={days}
					selectedDayId={selection.dayId}
					onSelectDay={onSelectDay}
					onAddDay={onAddDay}
				/>
			</PlanColumn>
		</LabeledPlanColumn>
		<LabeledPlanColumn
			label="Day"
			title={selectedDay?.label}
			meta={selectedDay?.memo}
			actions={
				selectedDay === undefined ? undefined : (
					<DayHeaderActions
						day={selectedDay}
						onChangeDayInfo={onChangeDayInfo}
						onDeleteDay={onDeleteDay}
					/>
				)
			}
		>
			<PlanColumn>
				{selectedDay === undefined ? (
					<MissingParentState>
						Day を選ぶと、種目計画を追加・確認できます。
					</MissingParentState>
				) : (
					<ExercisePlanList
						day={selectedDay}
						registeredExercises={registeredExercises}
						selectedExercisePlanId={selection.exercisePlanId}
						onSelectExercisePlan={onSelectExercisePlan}
						onAddExercisePlanWithSelectedExercise={
							onAddExercisePlanWithSelectedExercise
						}
						onAddExercisePlanWithNewExercise={onAddExercisePlanWithNewExercise}
						workoutHistory={renderWorkoutHistory(selectedDay)}
					/>
				)}
			</PlanColumn>
		</LabeledPlanColumn>
		<LabeledPlanColumn
			label="種目計画"
			title={selectedExercisePlan?.exercise.name}
			meta={selectedExercisePlan?.memo}
			actions={
				selectedExercisePlan === undefined ? undefined : (
					<ExercisePlanHeaderActions
						exercisePlan={selectedExercisePlan}
						onChangeExercisePlanInfo={onChangeExercisePlanInfo}
						onDeleteExercisePlan={onDeleteExercisePlan}
					/>
				)
			}
		>
			<PlanColumn>
				{selectedExercisePlan === undefined ? (
					<MissingParentState>
						種目計画を選ぶと、セット計画を追加・確認できます。
					</MissingParentState>
				) : (
					<SetPlanList
						exercisePlan={selectedExercisePlan}
						onChangeSetPlan={onChangeSetPlan}
						onAddSetPlan={onAddSetPlan}
						onDeleteSetPlan={onDeleteSetPlan}
						exerciseProgress={renderExerciseProgress(selectedExercisePlan)}
					/>
				)}
			</PlanColumn>
		</LabeledPlanColumn>
	</>
);
