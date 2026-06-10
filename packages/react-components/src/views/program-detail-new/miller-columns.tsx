import type { ComponentProps, FC } from "react";
import { DayHeaderActions } from "./day-header-actions";
import { DayList } from "./day-list";
import { ExercisePlanHeaderActions } from "./exercise-plan-header-actions";
import { ExercisePlanList } from "./exercise-plan-list";
import { LabeledPlanColumn } from "./labeled-plan-column";
import { MissingParentState } from "./missing-parent-state";
import { PlanColumn } from "./plan-column";
import { ProgramInfoDialogButton } from "./program-info-dialog-button";
import type { ProgramPlanNavigation } from "./program-plan-navigation";
import { SetPlanList } from "./set-plan-list";

type Props = ComponentProps<typeof ProgramPlanNavigation>;

export const MillerColumns: FC<Props> = ({
	programName,
	programMeta,
	days,
	availableExercises,
	selection,
	selectedDay,
	selectedExercisePlan,
	lastAddedExercisePlanId,
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
			meta={selectedDay?.memo ?? undefined}
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
						availableExercises={availableExercises}
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
			meta={selectedExercisePlan?.memo ?? undefined}
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
						autoFocusAddTrigger={
							selectedExercisePlan.id === lastAddedExercisePlanId
						}
						exerciseProgress={renderExerciseProgress(selectedExercisePlan)}
					/>
				)}
			</PlanColumn>
		</LabeledPlanColumn>
	</>
);
