"use client";

import type { FC, ReactNode } from "react";
import { Heading, Section } from "../../primitives/heading";
import type { Day } from "./day-list";
import {
	DrilldownPanel,
	DrilldownPanelError,
	DrilldownPanelLoading,
} from "./drilldown-panel";
import type { RegisteredExercise } from "./exercise-plan-list";
import type { ProgramPlanViewProps } from "./miller-columns";
import {
	MillerColumns,
	MillerColumnsError,
	MillerColumnsLoading,
} from "./miller-columns";
import type { UseProgramPlanSelectionState } from "./use-program-plan-selection";
import { useProgramPlanSelection } from "./use-program-plan-selection";

type ProgramDetailNewDataProps = {
	name: string;
	meta?: string | undefined;
	days: Day[];
	registeredExercises: RegisteredExercise[];
	initialState?: UseProgramPlanSelectionState | undefined;
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
	initialState,
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
	const [state, { selectDay, selectExercisePlan, selectRoot }] =
		useProgramPlanSelection({
			days,
			initialState,
		});

	const planViewProps: ProgramPlanViewProps = {
		programName: name,
		programMeta: meta,
		days,
		registeredExercises,
		state,
		onSelectDay: selectDay,
		onSelectExercisePlan: selectExercisePlan,
		onSelectRoot: selectRoot,
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
				<MillerColumns {...planViewProps} />
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
		<MillerColumnsLoading />
		<div className="@min-[56rem]:hidden">
			<DrilldownPanelLoading />
		</div>
	</div>
);

type ProgramDetailNewErrorProps = {
	message?: ReactNode;
};

export const ProgramDetailNewError: FC<ProgramDetailNewErrorProps> = ({
	message,
}) => (
	<div className="@container flex flex-col gap-3">
		<Heading className="sr-only">プログラム詳細</Heading>
		<MillerColumnsError message={message} />
		<div className="@min-[56rem]:hidden">
			<DrilldownPanelError message={message} />
		</div>
	</div>
);
