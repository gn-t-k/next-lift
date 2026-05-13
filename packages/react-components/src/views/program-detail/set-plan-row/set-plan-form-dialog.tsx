"use client";

import type { FC } from "react";
import { useRef, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "../../../primitives/tabs";
import type { Pattern, SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { RepsField, RpeField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";

type Draft = {
	kind: Pattern;
	weight: number | null;
	reps: number | null;
	rpe: number | null;
};

type Props = {
	mode: "add" | "edit";
	exerciseName: string;
	weightUnit: WeightUnit;
	weightStep: number;
	index: number;
	initial: SetPlanWithParams | undefined;
	onSubmit: (payload: SetPlanWithParams) => void;
};

export const SetPlanFormDialog: FC<Props> = ({
	mode,
	exerciseName,
	weightUnit,
	weightStep,
	index,
	initial,
	onSubmit,
}) => {
	const dialogTitle =
		mode === "add"
			? `${exerciseName} ${index + 1}セット目を追加`
			: `${exerciseName} ${index + 1}セット目`;
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Draft>(() => makeInitialDraft(initial));
	const draftRef = useRef<Draft>(makeInitialDraft(initial));

	const writeDraft = (next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	};

	const resetDraft = () => {
		const init = makeInitialDraft(initial);
		draftRef.current = init;
		setDraft(init);
	};

	const handleOpenChange = (open: boolean) => {
		resetDraft();
		setIsOpen(open);
	};

	const handleCommit = () => {
		// onSelectionChange と同じ理由（React Aria Button の preventDefault で
		// blur が発火しない）で、active input を明示的に blur して NumberField の
		// 値を commit させてから payload を組み立てる
		if (document.activeElement instanceof HTMLInputElement) {
			document.activeElement.blur();
		}
		const payload = buildPayloadFromDraft(draftRef.current);
		if (payload !== null) {
			onSubmit(payload);
		}
		resetDraft();
		setIsOpen(false);
	};

	const isCommitDisabled = buildPayloadFromDraft(draft) === null;

	return (
		<SetPlanRowEditTrigger
			title={dialogTitle}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			onCommit={handleCommit}
			isCommitDisabled={isCommitDisabled}
			{...(mode === "add" ? { affordanceLabel: "セットを追加" } : {})}
		>
			<Tabs
				selectedKey={draft.kind}
				onSelectionChange={(key) => {
					// React Aria の Button は pointer down で preventDefault するため
					// マウスクリックではフォーカスが奪われず、focused input の blur が
					// 発火しない。Tab 切替で TabPanel が unmount される前に active input
					// を明示的に blur して NumberField の値を commit させる
					if (document.activeElement instanceof HTMLInputElement) {
						document.activeElement.blur();
					}
					writeDraft({ ...draftRef.current, kind: key as Pattern });
				}}
			>
				<TabList aria-label="セットの種類">
					<Tab id="weight-x-reps">重量×回数</Tab>
					<Tab id="weight-x-rpe">重量×RPE</Tab>
					<Tab id="reps-x-rpe">回数×RPE</Tab>
				</TabList>
				<TabPanel id="weight-x-reps">
					<div className="flex flex-col gap-3 pt-3">
						<WeightField
							value={draft.weight}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, weight: next })
							}
							weightUnit={weightUnit}
							weightStep={weightStep}
						/>
						<RepsField
							value={draft.reps}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, reps: next })
							}
						/>
					</div>
				</TabPanel>
				<TabPanel id="weight-x-rpe">
					<div className="flex flex-col gap-3 pt-3">
						<WeightField
							value={draft.weight}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, weight: next })
							}
							weightUnit={weightUnit}
							weightStep={weightStep}
						/>
						<RpeField
							value={draft.rpe}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, rpe: next })
							}
						/>
					</div>
				</TabPanel>
				<TabPanel id="reps-x-rpe">
					<div className="flex flex-col gap-3 pt-3">
						<RepsField
							value={draft.reps}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, reps: next })
							}
						/>
						<RpeField
							value={draft.rpe}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, rpe: next })
							}
						/>
					</div>
				</TabPanel>
			</Tabs>
		</SetPlanRowEditTrigger>
	);
};

const makeInitialDraft = (initial: SetPlanWithParams | undefined): Draft => {
	if (initial === undefined) {
		return { kind: "weight-x-reps", weight: null, reps: null, rpe: null };
	}
	switch (initial.pattern) {
		case "weight-x-reps":
			return {
				kind: "weight-x-reps",
				weight: initial.weight,
				reps: initial.reps,
				rpe: null,
			};
		case "weight-x-rpe":
			return {
				kind: "weight-x-rpe",
				weight: initial.weight,
				reps: null,
				rpe: initial.rpe,
			};
		case "reps-x-rpe":
			return {
				kind: "reps-x-rpe",
				weight: null,
				reps: initial.reps,
				rpe: initial.rpe,
			};
	}
};

const buildPayloadFromDraft = (draft: Draft): SetPlanWithParams | null => {
	switch (draft.kind) {
		case "weight-x-reps":
			if (draft.weight === null || draft.reps === null) return null;
			return {
				pattern: "weight-x-reps",
				weight: draft.weight,
				reps: draft.reps,
			};
		case "weight-x-rpe":
			if (draft.weight === null || draft.rpe === null) return null;
			return {
				pattern: "weight-x-rpe",
				weight: draft.weight,
				rpe: draft.rpe,
			};
		case "reps-x-rpe":
			if (draft.reps === null || draft.rpe === null) return null;
			return { pattern: "reps-x-rpe", reps: draft.reps, rpe: draft.rpe };
	}
};
