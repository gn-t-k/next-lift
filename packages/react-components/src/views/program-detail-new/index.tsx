"use client";

import {
	ChevronRightIcon,
	ExclamationTriangleIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { cn } from "../../libs";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { skeletonClass } from "../../primitives/skeleton";
import type { Day } from "./day-list";
import { DrilldownPanel } from "./drilldown-panel";
import type { RegisteredExercise } from "./exercise-plan-list";
import { LabeledPlanColumn } from "./labeled-plan-column";
import type { ProgramPlanViewProps } from "./miller-columns";
import { MillerColumns } from "./miller-columns";
import { PlanColumn } from "./plan-column";
import { ProgramPlanGrid } from "./program-plan-grid";
import { useProgramPlanSelection } from "./use-program-plan-selection";

type ProgramDetailNewDataProps = {
	name: string;
	meta?: string | undefined;
	days: Day[];
	registeredExercises: RegisteredExercise[];
	defaultSelectedDayId?: string | undefined;
	defaultSelectedExercisePlanId?: string | undefined;
};

type ProgramDetailNewCallbackProps = Pick<
	ProgramPlanViewProps,
	| "onAddDay"
	| "onDeleteDay"
	| "onChangeDayInfo"
	| "onChangeProgramInfo"
	| "onAddExercisePlanWithSelectedExercise"
	| "onAddExercisePlanWithNewExercise"
	| "onChangeExercisePlanInfo"
	| "onDeleteExercisePlan"
	| "onChangeSetPlan"
	| "onAddSetPlan"
	| "onDeleteSetPlan"
	| "renderWorkoutHistory"
	| "renderExerciseProgress"
>;

type Props = ProgramDetailNewDataProps & ProgramDetailNewCallbackProps;

export const ProgramDetailNew: FC<Props> = ({
	name,
	meta,
	days,
	registeredExercises,
	defaultSelectedDayId,
	defaultSelectedExercisePlanId,
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

	const planViewProps: ProgramPlanViewProps = {
		programName: name,
		programMeta: meta,
		days,
		registeredExercises,
		selection,
		selectedDay,
		selectedExercisePlan,
		currentTarget,
		onSelectDay: selectDay,
		onSelectExercisePlan: selectExercisePlan,
		onSelectRoot: selectRoot,
		onSelectTarget: selectTarget,
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
	};

	return (
		<div className="@container flex flex-col gap-6">
			<Heading className="sr-only">{name}</Heading>
			<Section className="@container flex flex-col gap-3">
				<Heading className="sr-only">プログラム内容</Heading>
				<ProgramPlanGrid>
					<MillerColumns {...planViewProps} />
				</ProgramPlanGrid>
				<div className="@min-[56rem]:hidden">
					<DrilldownPanel {...planViewProps} />
				</div>
			</Section>
		</div>
	);
};

export const ProgramDetailNewLoading: FC = () => (
	<div className="@container flex flex-col gap-3" aria-busy>
		<Heading className="sr-only">プログラム詳細</Heading>
		<span className="sr-only">プログラム詳細を読み込み中</span>
		<ProgramPlanGrid>
			<LoadingLabeledColumn />
			<IdleLabeledColumn label="Day" />
			<IdleLabeledColumn label="種目計画" />
		</ProgramPlanGrid>
		<div className="@min-[56rem]:hidden">
			<PlanColumn
				title={<SkeletonText className="h-7 w-2/3" />}
				meta={<SkeletonText className="h-3 w-full" />}
				actions={<DisabledEditButton />}
				className="min-h-[30rem]"
				variant="plain"
			>
				<div className="flex min-h-0 flex-1 flex-col gap-2">
					{SKELETON_DAY_KEYS.map((item) => (
						<SkeletonRow key={item} />
					))}
					<div className={cn(skeletonClass, "h-12 w-full rounded-lg")} />
				</div>
			</PlanColumn>
		</div>
	</div>
);

type ProgramDetailNewErrorProps = {
	message?: ReactNode;
};

export const ProgramDetailNewError: FC<ProgramDetailNewErrorProps> = ({
	message,
}) => {
	const description = message ?? "時間をおいて再読み込みしてください。";

	return (
		<div className="@container flex flex-col gap-3">
			<Heading className="sr-only">プログラム詳細</Heading>
			<ProgramPlanGrid>
				<ErrorLabeledColumn label="プログラム" description={description} />
				<IdleLabeledColumn label="Day" />
				<IdleLabeledColumn label="種目計画" />
			</ProgramPlanGrid>
			<div className="@min-[56rem]:hidden">
				<PlanColumn
					title={<ErrorTitle />}
					meta={description}
					actions={<WarningIcon />}
					className="min-h-[30rem]"
					variant="plain"
				>
					<IdleBody />
				</PlanColumn>
			</div>
		</div>
	);
};

const SKELETON_DAY_KEYS = ["day-1", "day-2", "day-3"];

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
