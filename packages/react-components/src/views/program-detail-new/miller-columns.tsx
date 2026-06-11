import {
	ChevronRightIcon,
	ExclamationTriangleIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { skeletonClass } from "../../primitives/skeleton";
import type { OnChangeDayInfo, OnDeleteDay } from "./day-header-actions";
import { DayHeaderActions } from "./day-header-actions";
import type { Day, OnAddDay, OnSelectDay } from "./day-list";
import { DayList } from "./day-list";
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
		<LoadingLabeledColumn />
		<IdleLabeledColumn label="Day" />
		<IdleLabeledColumn label="種目計画" />
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
			<ErrorLabeledColumn label="プログラム" description={description} />
			<IdleLabeledColumn label="Day" />
			<IdleLabeledColumn label="種目計画" />
		</ThreeColumnLayout>
	);
};

const SKELETON_DAY_KEYS = ["day-1", "day-2", "day-3"];

const ThreeColumnLayout: FC<PropsWithChildren> = ({ children }) => (
	<div className="grid h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] items-stretch gap-3">
		{children}
	</div>
);

const LoadingLabeledColumn: FC = () => (
	<LabeledPlanColumn
		label="プログラム"
		title={<SkeletonText className="h-5 w-28" />}
		meta={<SkeletonText className="h-3 w-56" />}
		actions={<DisabledEditButton />}
	>
		<PlanColumn>
			<div className="flex min-h-0 flex-1 flex-col gap-2">
				{SKELETON_DAY_KEYS.map((item) => (
					<SkeletonRow key={item} />
				))}
				<div className={cn(skeletonClass, "mt-1 h-9 w-32 rounded-lg")} />
			</div>
		</PlanColumn>
	</LabeledPlanColumn>
);

const IdleLabeledColumn: FC<{ label: string }> = ({ label }) => (
	<LabeledPlanColumn label={label}>
		<PlanColumn>
			<IdleBody />
		</PlanColumn>
	</LabeledPlanColumn>
);

const ErrorLabeledColumn: FC<{ label: string; description: ReactNode }> = ({
	label,
	description,
}) => (
	<LabeledPlanColumn
		label={label}
		title={<ErrorTitle compact />}
		meta={description}
		actions={<WarningIcon />}
	>
		<PlanColumn>
			<IdleBody />
		</PlanColumn>
	</LabeledPlanColumn>
);

const SkeletonRow: FC = () => (
	<div className="flex h-12 items-center gap-2 rounded-lg border border-transparent px-3 py-2">
		<div className="min-w-0 flex-1">
			<div className={cn(skeletonClass, "h-5 w-3/4")} />
			<div className={cn(skeletonClass, "mt-2 h-3 w-16")} />
		</div>
		<ChevronRightIcon
			data-slot="icon"
			className="size-4 shrink-0 text-muted-fg/45"
			aria-hidden
		/>
	</div>
);

const SkeletonText: FC<{ className: string }> = ({ className }) => (
	<span aria-hidden className={cn(skeletonClass, "block", className)} />
);

const DisabledEditButton: FC = () => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label="プログラム情報を編集"
		isDisabled
		className="shrink-0"
	>
		<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);

const ErrorTitle: FC<{ compact?: boolean | undefined }> = ({
	compact = false,
}) => (
	<span
		role="alert"
		className={cn(
			"block truncate font-medium text-fg",
			compact ? "mt-0.5 text-base" : "@min-[56rem]:text-base text-xl",
		)}
	>
		プログラムを取得できませんでした
	</span>
);

const IdleBody: FC = () => <div aria-hidden className="min-h-24 flex-1" />;

const WarningIcon: FC = () => (
	<ExclamationTriangleIcon
		aria-hidden
		className="mt-0.5 size-5 shrink-0 text-warning"
	/>
);
