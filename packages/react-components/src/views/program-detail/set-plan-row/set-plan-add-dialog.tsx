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
	exerciseName: string;
	weightUnit: WeightUnit;
	weightStep: number;
	nextIndex: number;
	previousSetPlan: SetPlanWithParams | undefined;
	onAdd: (payload: SetPlanWithParams) => void;
};

export const SetPlanAddDialog: FC<Props> = ({
	exerciseName,
	weightUnit,
	weightStep,
	nextIndex,
	previousSetPlan,
	onAdd,
}) => {
	const dialogTitle = `${exerciseName} ${nextIndex + 1}セット目を追加`;
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Draft>(() =>
		makeInitialDraft(previousSetPlan),
	);
	const draftRef = useRef<Draft>(makeInitialDraft(previousSetPlan));

	const writeDraft = (next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	};

	const resetDraft = () => {
		const init = makeInitialDraft(previousSetPlan);
		draftRef.current = init;
		setDraft(init);
	};

	const handleOpenChange = (open: boolean) => {
		resetDraft();
		setIsOpen(open);
	};

	const handleCommit = () => {
		const payload = buildPayloadFromDraft(draftRef.current);
		if (payload !== null) {
			onAdd(payload);
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
			affordanceLabel="セットを追加"
		>
			<Tabs
				selectedKey={draft.kind}
				onSelectionChange={(key) =>
					writeDraft({ ...draftRef.current, kind: key as Pattern })
				}
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

const makeInitialDraft = (previous: SetPlanWithParams | undefined): Draft => {
	if (previous === undefined) {
		return { kind: "weight-x-reps", weight: null, reps: null, rpe: null };
	}
	switch (previous.pattern) {
		case "weight-x-reps":
			return {
				kind: "weight-x-reps",
				weight: previous.weight,
				reps: previous.reps,
				rpe: null,
			};
		case "weight-x-rpe":
			return {
				kind: "weight-x-rpe",
				weight: previous.weight,
				reps: null,
				rpe: previous.rpe,
			};
		case "reps-x-rpe":
			return {
				kind: "reps-x-rpe",
				weight: null,
				reps: previous.reps,
				rpe: previous.rpe,
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
