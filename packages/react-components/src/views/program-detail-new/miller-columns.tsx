import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { cn } from "../../libs";
import { skeletonClass } from "../../primitives/skeleton";
import type { OnChangeDayInfo, OnDeleteDay } from "./day-header-actions";
import { DayHeaderActions } from "./day-header-actions";
import type { Day, OnAddDay, OnSelectDay } from "./day-list";
import { DayList, DayListLoading } from "./day-list";
import type {
	OnChangeExercisePlanInfo,
	OnDeleteExercisePlan,
} from "./exercise-plan-header-actions";
import { ExercisePlanHeaderActions } from "./exercise-plan-header-actions";
import type {
	OnAddExercisePlanWithNewExercise,
	OnAddExercisePlanWithSelectedExercise,
	OnSelectExercisePlan,
	RegisteredExercise,
	RenderWorkoutHistory,
} from "./exercise-plan-list";
import { ExercisePlanList } from "./exercise-plan-list";
import { LabeledPlanColumn } from "./labeled-plan-column";
import { MissingParentState } from "./missing-parent-state";
import { PlanColumn } from "./plan-column";
import type { OnChangeProgramInfo } from "./program-info-dialog-button";
import {
	ProgramInfoDialogButton,
	ProgramInfoDialogButtonLoading,
} from "./program-info-dialog-button";
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

export const MillerColumns: FC<Props> = ({
	programName,
	programMeta,
	days,
	registeredExercises,
	state,
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
}) => {
	const selectedDay =
		state.level === "root"
			? undefined
			: days.find((day) => day.id === state.dayId);
	const selectedExercisePlan =
		state.level === "exercisePlan" && selectedDay !== undefined
			? selectedDay.exercisePlans.find(
					(exercisePlan) => exercisePlan.id === state.exercisePlanId,
				)
			: undefined;

	return (
		<ThreeColumnLayout>
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
						state={state}
						onSelectDay={onSelectDay}
						onAddDay={onAddDay}
					/>
				</PlanColumn>
			</LabeledPlanColumn>
			<LabeledPlanColumn
				label="Day"
				title={selectedDay?.label}
				meta={selectedDay?.meta}
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
							state={state}
							onSelectExercisePlan={onSelectExercisePlan}
							onAddExercisePlanWithSelectedExercise={
								onAddExercisePlanWithSelectedExercise
							}
							onAddExercisePlanWithNewExercise={
								onAddExercisePlanWithNewExercise
							}
							workoutHistory={renderWorkoutHistory(selectedDay)}
						/>
					)}
				</PlanColumn>
			</LabeledPlanColumn>
			<LabeledPlanColumn
				label="種目計画"
				title={selectedExercisePlan?.exercise.name}
				meta={selectedExercisePlan?.meta}
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
		</ThreeColumnLayout>
	);
};

export const MillerColumnsLoading: FC = () => (
	<ThreeColumnLayout>
		<LabeledPlanColumn
			label="プログラム"
			title={
				<span aria-hidden className={cn(skeletonClass, "block h-5 w-28")} />
			}
			meta={
				<span aria-hidden className={cn(skeletonClass, "block h-3 w-56")} />
			}
			actions={<ProgramInfoDialogButtonLoading />}
		>
			<PlanColumn>
				<DayListLoading />
			</PlanColumn>
		</LabeledPlanColumn>
		<LabeledPlanColumn label="Day">
			<PlanColumn>
				<div aria-hidden className="min-h-24 flex-1" />
			</PlanColumn>
		</LabeledPlanColumn>
		<LabeledPlanColumn label="種目計画">
			<PlanColumn>
				<div aria-hidden className="min-h-24 flex-1" />
			</PlanColumn>
		</LabeledPlanColumn>
	</ThreeColumnLayout>
);

type MillerColumnsErrorProps = {
	message?: ReactNode;
};

export const MillerColumnsError: FC<MillerColumnsErrorProps> = ({
	message,
}) => {
	const description = message ?? "時間をおいて再読み込みしてください。";

	return (
		<ThreeColumnLayout>
			<LabeledPlanColumn
				label="プログラム"
				title={
					<span
						role="alert"
						className="mt-0.5 block truncate font-medium text-base text-fg"
					>
						プログラムを取得できませんでした
					</span>
				}
				meta={description}
				actions={
					<ExclamationTriangleIcon
						aria-hidden
						className="mt-0.5 size-5 shrink-0 text-warning"
					/>
				}
			>
				<PlanColumn>
					<div aria-hidden className="min-h-24 flex-1" />
				</PlanColumn>
			</LabeledPlanColumn>
			<LabeledPlanColumn label="Day">
				<PlanColumn>
					<div aria-hidden className="min-h-24 flex-1" />
				</PlanColumn>
			</LabeledPlanColumn>
			<LabeledPlanColumn label="種目計画">
				<PlanColumn>
					<div aria-hidden className="min-h-24 flex-1" />
				</PlanColumn>
			</LabeledPlanColumn>
		</ThreeColumnLayout>
	);
};

const ThreeColumnLayout: FC<PropsWithChildren> = ({ children }) => (
	<div className="grid h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] items-stretch gap-3">
		{children}
	</div>
);
