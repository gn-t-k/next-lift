"use client";

import {
	CheckIcon,
	ChevronLeftIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { cn, useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { Heading, Section } from "../../primitives/heading";
import { Label } from "../../primitives/label";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { TextArea } from "../../primitives/text-area";
import { TextField, TextFieldInput } from "../../primitives/text-field";
import type { SetPlanDraft } from "../program-detail/set-plan-section/set-plan-types";
import { BreadcrumbJumpSheet } from "./jump-sheet";
import { LabeledPlanColumn, PlanColumn } from "./plan-layout";
import {
	DayList,
	ExercisePlanList,
	MissingParentState,
	SetPlanList,
} from "./plan-nodes";
import type {
	AvailableExercise,
	Day,
	ExercisePlan,
	NavigationTarget,
	ProgramPlanSelection,
} from "./types";

type Props = {
	programName: string;
	programMeta: string | null;
	programActions: ReactNode;
	days: Day[];
	availableExercises: AvailableExercise[];
	selection: ProgramPlanSelection;
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
	currentTarget: NavigationTarget | undefined;
	lastAddedExercisePlanId?: string | undefined;
	onSelectDay: (dayId: string) => void;
	onSelectExercisePlan: (dayId: string, exercisePlanId: string) => void;
	onSelectRoot: () => void;
	onSelectTarget: (target: NavigationTarget) => void;
	onAddDay: () => void;
	onDeleteDay: (dayId: string) => void;
	onChangeDayInfo: (
		dayId: string,
		payload: { label: string; memo: string | null },
	) => void;
	onAddExercisePlanWithSelectedExercise: (
		dayId: string,
		exerciseId: string,
	) => void;
	onAddExercisePlanWithNewExercise: (dayId: string, name: string) => void;
	onChangeExercisePlanInfo: (
		exercisePlanId: string,
		payload: { memo: string | null },
	) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
	onChangeSetPlan: (setPlanId: string, payload: SetPlanDraft) => void;
	onAddSetPlan: (exercisePlanId: string, payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: string) => void;
	renderWorkoutHistory: (day: Day) => ReactNode;
	renderExerciseProgress: (exercisePlan: ExercisePlan) => ReactNode;
};

export const ProgramPlanNavigation: FC<Props> = (props) => (
	<Section className="@container flex flex-col gap-3">
		<Heading className="sr-only">プログラム内容</Heading>
		<div className="@min-[56rem]:grid hidden h-[32rem] grid-cols-[minmax(13rem,0.9fr)_minmax(17rem,1fr)_minmax(20rem,1.25fr)] items-stretch gap-3">
			<MillerColumns {...props} />
		</div>
		<div className="@min-[56rem]:hidden">
			<DrilldownPanel {...props} />
		</div>
	</Section>
);

const MillerColumns: FC<Props> = ({
	programName,
	programMeta,
	programActions,
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
			actions={programActions}
		>
			<PlanColumn>
				<DayList
					days={days}
					selection={selection}
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
					<HeaderActions>
						<DayInfoDialogButton day={selectedDay} onChange={onChangeDayInfo} />
						<HeaderDeleteButton
							label={`${selectedDay.label}を削除`}
							onDelete={() => onDeleteDay(selectedDay.id)}
						/>
					</HeaderActions>
				)
			}
		>
			<PlanColumn>
				<ExercisePlanList
					day={selectedDay}
					availableExercises={availableExercises}
					selection={selection}
					onSelectExercisePlan={onSelectExercisePlan}
					onAddExercisePlanWithSelectedExercise={
						onAddExercisePlanWithSelectedExercise
					}
					onAddExercisePlanWithNewExercise={onAddExercisePlanWithNewExercise}
					workoutHistory={
						selectedDay === undefined
							? undefined
							: renderWorkoutHistory(selectedDay)
					}
				/>
			</PlanColumn>
		</LabeledPlanColumn>
		<LabeledPlanColumn
			label="種目計画"
			actions={
				selectedExercisePlan === undefined ? undefined : (
					<HeaderActions>
						<ExercisePlanMemoDialogButton
							exercisePlan={selectedExercisePlan}
							onChange={onChangeExercisePlanInfo}
						/>
						<HeaderDeleteButton
							label={`${selectedExercisePlan.exercise.name}の種目計画を削除`}
							onDelete={() => onDeleteExercisePlan(selectedExercisePlan.id)}
						/>
					</HeaderActions>
				)
			}
			title={selectedExercisePlan?.exercise.name}
			meta={selectedExercisePlan?.memo ?? undefined}
		>
			<PlanColumn>
				<SetPlanList
					exercisePlan={selectedExercisePlan}
					onChangeSetPlan={onChangeSetPlan}
					onAddSetPlan={onAddSetPlan}
					onDeleteSetPlan={onDeleteSetPlan}
					autoFocusAddTrigger={
						selectedExercisePlan?.id === lastAddedExercisePlanId
					}
					exerciseProgress={
						selectedExercisePlan === undefined
							? undefined
							: renderExerciseProgress(selectedExercisePlan)
					}
				/>
			</PlanColumn>
		</LabeledPlanColumn>
	</>
);

const DrilldownPanel: FC<Props> = ({
	programName,
	programMeta,
	programActions,
	days,
	availableExercises,
	selection,
	selectedDay,
	selectedExercisePlan,
	currentTarget,
	lastAddedExercisePlanId,
	onSelectDay,
	onSelectExercisePlan,
	onSelectRoot,
	onSelectTarget,
	onAddDay,
	onDeleteDay,
	onChangeDayInfo,
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
	const activeLevel = resolveDrilldownLevel(selection);

	return (
		<div className="relative flex flex-col gap-3 pb-16">
			<PlanColumn
				title={getDrilldownTitle({
					level: activeLevel,
					programName,
					selectedDay,
					selectedExercisePlan,
				})}
				meta={
					activeLevel === "day"
						? programMeta
						: activeLevel === "exercise"
							? selectedDay?.memo
							: activeLevel === "set"
								? selectedExercisePlan?.memo
								: undefined
				}
				leading={getDrilldownBackAction({
					activeLevel,
					selectedDay,
					onSelectRoot,
					onSelectDay,
				})}
				actions={getDrilldownActions({
					activeLevel,
					programActions,
					selectedDay,
					selectedExercisePlan,
					onDeleteDay,
					onChangeDayInfo,
					onChangeExercisePlanInfo,
					onDeleteExercisePlan,
				})}
				className="min-h-[30rem]"
				variant="plain"
			>
				<DrilldownTransition days={days} target={currentTarget}>
					{(() => {
						switch (activeLevel) {
							case "day":
								return (
									<DayList
										days={days}
										selection={selection}
										onSelectDay={onSelectDay}
										onAddDay={onAddDay}
									/>
								);
							case "exercise":
								return (
									<ExercisePlanList
										day={selectedDay}
										availableExercises={availableExercises}
										selection={selection}
										onSelectExercisePlan={onSelectExercisePlan}
										onAddExercisePlanWithSelectedExercise={
											onAddExercisePlanWithSelectedExercise
										}
										onAddExercisePlanWithNewExercise={
											onAddExercisePlanWithNewExercise
										}
										workoutHistory={
											selectedDay === undefined
												? undefined
												: renderWorkoutHistory(selectedDay)
										}
									/>
								);
							case "set":
								return selectedExercisePlan === undefined ? (
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
										exerciseProgress={renderExerciseProgress(
											selectedExercisePlan,
										)}
									/>
								);
						}
					})()}
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

type DrilldownActionsProps = {
	activeLevel: DrilldownLevel;
	programActions: ReactNode;
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
	onDeleteDay: (dayId: string) => void;
	onChangeDayInfo: (
		dayId: string,
		payload: { label: string; memo: string | null },
	) => void;
	onChangeExercisePlanInfo: (
		exercisePlanId: string,
		payload: { memo: string | null },
	) => void;
	onDeleteExercisePlan: (exercisePlanId: string) => void;
};

const getDrilldownActions = ({
	activeLevel,
	programActions,
	selectedDay,
	selectedExercisePlan,
	onDeleteDay,
	onChangeDayInfo,
	onChangeExercisePlanInfo,
	onDeleteExercisePlan,
}: DrilldownActionsProps): ReactNode => {
	switch (activeLevel) {
		case "day":
			return programActions;
		case "exercise":
			return selectedDay === undefined ? undefined : (
				<HeaderActions>
					<DayInfoDialogButton day={selectedDay} onChange={onChangeDayInfo} />
					<HeaderDeleteButton
						label={`${selectedDay.label}を削除`}
						onDelete={() => onDeleteDay(selectedDay.id)}
					/>
				</HeaderActions>
			);
		case "set":
			return selectedExercisePlan === undefined ? undefined : (
				<HeaderActions>
					<ExercisePlanMemoDialogButton
						exercisePlan={selectedExercisePlan}
						onChange={onChangeExercisePlanInfo}
					/>
					<HeaderDeleteButton
						label={`${selectedExercisePlan.exercise.name}の種目計画を削除`}
						onDelete={() => onDeleteExercisePlan(selectedExercisePlan.id)}
					/>
				</HeaderActions>
			);
	}
};

const HeaderActions: FC<{ children: ReactNode }> = ({ children }) => (
	<div className="flex shrink-0 items-center gap-1">{children}</div>
);

type HeaderDeleteButtonProps = {
	label: string;
	onDelete: () => void;
};

const HeaderDeleteButton: FC<HeaderDeleteButtonProps> = ({
	label,
	onDelete,
}) => (
	<Button
		intent="plain"
		size="sq-xs"
		aria-label={label}
		onPress={onDelete}
		className="shrink-0"
	>
		<TrashIcon data-slot="icon" className="size-4" aria-hidden />
	</Button>
);

type DayInfoDialogButtonProps = {
	day: Day;
	onChange: (
		dayId: string,
		payload: { label: string; memo: string | null },
	) => void;
};

const DayInfoDialogButton: FC<DayInfoDialogButtonProps> = ({
	day,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [draftLabel, setDraftLabel] = useState(day.label);
	const [draftMemo, setDraftMemo] = useState(day.memo ?? "");
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = `${day.label}を編集`;
	const nextLabel = draftLabel.trim();
	const isSubmitDisabled = nextLabel === "";

	useEffect(() => {
		if (isOpen) {
			setDraftLabel(day.label);
			setDraftMemo(day.memo ?? "");
		}
	}, [day.label, day.memo, isOpen]);

	return (
		<ResponsiveDialog
			title={title}
			trigger={
				<Button
					intent="plain"
					size="sq-xs"
					aria-label={title}
					className="shrink-0"
				>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			desktopViewport={desktopViewport}
			popoverWidth="default"
		>
			<form
				className="flex flex-col gap-3"
				onSubmit={(event) => {
					event.preventDefault();
					if (isSubmitDisabled) return;
					const memo = draftMemo.trim();
					onChange(day.id, {
						label: nextLabel,
						memo: memo === "" ? null : memo,
					});
					setIsOpen(false);
				}}
			>
				<TextField value={draftLabel} onChange={setDraftLabel}>
					<Label>名前</Label>
					<TextFieldInput />
				</TextField>
				<TextField value={draftMemo} onChange={setDraftMemo}>
					<Label>メモ</Label>
					<TextArea rows={3} />
				</TextField>
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						intent="plain"
						size="sm"
						onPress={() => setIsOpen(false)}
					>
						キャンセル
					</Button>
					<Button
						type="submit"
						intent="primary"
						size="sm"
						isDisabled={isSubmitDisabled}
						className="[--btn-icon:var(--btn-fg)]"
					>
						<CheckIcon data-slot="icon" className="size-4" aria-hidden />
						確定
					</Button>
				</div>
			</form>
		</ResponsiveDialog>
	);
};

type ExercisePlanMemoDialogButtonProps = {
	exercisePlan: ExercisePlan;
	onChange: (exercisePlanId: string, payload: { memo: string | null }) => void;
};

const ExercisePlanMemoDialogButton: FC<ExercisePlanMemoDialogButtonProps> = ({
	exercisePlan,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [draftMemo, setDraftMemo] = useState(exercisePlan.memo ?? "");
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = `${exercisePlan.exercise.name}のメモを編集`;

	useEffect(() => {
		if (isOpen) {
			setDraftMemo(exercisePlan.memo ?? "");
		}
	}, [exercisePlan.memo, isOpen]);

	return (
		<ResponsiveDialog
			title={title}
			trigger={
				<Button
					intent="plain"
					size="sq-xs"
					aria-label={title}
					className="shrink-0"
				>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			desktopViewport={desktopViewport}
			popoverWidth="default"
		>
			<form
				className="flex flex-col gap-3"
				onSubmit={(event) => {
					event.preventDefault();
					const memo = draftMemo.trim();
					onChange(exercisePlan.id, { memo: memo === "" ? null : memo });
					setIsOpen(false);
				}}
			>
				<TextField value={draftMemo} onChange={setDraftMemo}>
					<Label>メモ</Label>
					<TextArea rows={3} />
				</TextField>
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						intent="plain"
						size="sm"
						onPress={() => setIsOpen(false)}
					>
						キャンセル
					</Button>
					<Button
						type="submit"
						intent="primary"
						size="sm"
						className="[--btn-icon:var(--btn-fg)]"
					>
						<CheckIcon data-slot="icon" className="size-4" aria-hidden />
						確定
					</Button>
				</div>
			</form>
		</ResponsiveDialog>
	);
};

type DrilldownLevel = "day" | "exercise" | "set";

const resolveDrilldownLevel = (
	selection: ProgramPlanSelection,
): DrilldownLevel => {
	if (selection.exercisePlanId !== undefined) {
		return "set";
	}
	if (selection.dayId !== undefined) {
		return "exercise";
	}
	return "day";
};

type DrilldownBackActionProps = {
	activeLevel: DrilldownLevel;
	selectedDay: Day | undefined;
	onSelectRoot: () => void;
	onSelectDay: (dayId: string) => void;
};

const getDrilldownBackAction = ({
	activeLevel,
	selectedDay,
	onSelectRoot,
	onSelectDay,
}: DrilldownBackActionProps): ReactNode => {
	switch (activeLevel) {
		case "day":
			return undefined;
		case "exercise":
			return (
				<Button
					intent="plain"
					size="sq-xs"
					aria-label="上の階層へ戻る"
					onPress={onSelectRoot}
				>
					<ChevronLeftIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			);
		case "set":
			return selectedDay === undefined ? undefined : (
				<Button
					intent="plain"
					size="sq-xs"
					aria-label="上の階層へ戻る"
					onPress={() => onSelectDay(selectedDay.id)}
				>
					<ChevronLeftIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			);
	}
};

type DrilldownTransitionProps = {
	days: Day[];
	target: NavigationTarget | undefined;
	children: ReactNode;
};

const DrilldownTransition: FC<DrilldownTransitionProps> = ({
	days,
	target,
	children,
}) => {
	const previousTargetRef = useRef<NavigationTarget | undefined>(target);
	const previousTarget = previousTargetRef.current;
	const animationClass = getTransitionClass(days, previousTarget, target);
	previousTargetRef.current = target;

	return (
		<div
			key={formatTargetKey(target)}
			className={cn("duration-200 motion-safe:animate-in", animationClass)}
		>
			{children}
		</div>
	);
};

const getTransitionClass = (
	days: Day[],
	previousTarget: NavigationTarget | undefined,
	nextTarget: NavigationTarget | undefined,
): string => {
	if (previousTarget === undefined || nextTarget === undefined) {
		return "fade-in";
	}

	const previousDepth = getTargetDepth(previousTarget);
	const nextDepth = getTargetDepth(nextTarget);
	if (nextDepth > previousDepth) {
		return "fade-in slide-in-from-right-4";
	}
	if (nextDepth < previousDepth) {
		return "fade-in slide-in-from-left-4";
	}

	const siblingDelta =
		getSiblingIndex(days, nextTarget) - getSiblingIndex(days, previousTarget);
	if (siblingDelta > 0) {
		return "fade-in slide-in-from-top-4";
	}
	if (siblingDelta < 0) {
		return "fade-in slide-in-from-bottom-4";
	}
	return "fade-in";
};

const getTargetDepth = (target: NavigationTarget): number => {
	switch (target.level) {
		case "root":
			return 0;
		case "day":
			return 1;
		case "exercise":
			return 2;
	}
};

const getSiblingIndex = (days: Day[], target: NavigationTarget): number => {
	switch (target.level) {
		case "root":
			return 0;
		case "day":
			return days.findIndex((day) => day.id === target.dayId);
		case "exercise": {
			const day = days.find((day) => day.id === target.dayId);
			return (
				day?.exercisePlans.findIndex(
					(exercisePlan) => exercisePlan.id === target.exercisePlanId,
				) ?? -1
			);
		}
	}
};

const formatTargetKey = (target: NavigationTarget | undefined): string => {
	if (target === undefined) {
		return "root";
	}
	switch (target.level) {
		case "root":
			return "root";
		case "day":
			return `day:${target.dayId}`;
		case "exercise":
			return `exercise:${target.dayId}:${target.exercisePlanId}`;
	}
};

type DrilldownTitleArgs = {
	level: DrilldownLevel;
	programName: string;
	selectedDay: Day | undefined;
	selectedExercisePlan: ExercisePlan | undefined;
};

const getDrilldownTitle = ({
	level,
	programName,
	selectedDay,
	selectedExercisePlan,
}: DrilldownTitleArgs): ReactNode => {
	switch (level) {
		case "day":
			return programName;
		case "exercise":
			return selectedDay === undefined
				? "Day"
				: (formatCompactDayLabel(selectedDay.label) ?? selectedDay.label);
		case "set":
			return selectedExercisePlan === undefined
				? "種目計画"
				: getExercisePlanTitle(selectedExercisePlan);
	}
};

const formatCompactDayLabel = (label: string | undefined): string | undefined =>
	label?.replace(/^Day\s*\d+\s*:\s*/u, "");

const getExercisePlanTitle = (exercisePlan: ExercisePlan): string =>
	exercisePlan.exercise.name;
