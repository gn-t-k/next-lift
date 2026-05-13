"use client";

import type { FC } from "react";
import { useRef, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "../../../primitives/tabs";
import type { Pattern, SetPlanWithParams, WeightUnit } from "../set-plan-types";
import { RepsField, RpeField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Draft = {
	kind: Pattern;
	weight: number | null;
	reps: number | null;
	rpe: number | null;
};

type Props = {
	index: number;
	exerciseName: string;
	weightUnit: WeightUnit;
	weightStep: number;
	onSubmit: (payload: SetPlanWithParams) => void;
	onDelete: () => void;
};

export const SetPlanRowEmpty: FC<Props> = ({
	index,
	exerciseName,
	weightUnit,
	weightStep,
	onSubmit,
	onDelete,
}) => {
	const setName = `${exerciseName} ${index + 1}セット目`;
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Draft>(initialDraft);
	const draftRef = useRef<Draft>(initialDraft);

	const writeDraft = (next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			writeDraft(initialDraft);
		} else {
			draftRef.current = initialDraft;
			setDraft(initialDraft);
		}
		setIsOpen(open);
	};

	const handleCommit = () => {
		const payload = buildPayloadFromDraft(draftRef.current);
		if (payload !== null) {
			onSubmit(payload);
		}
		draftRef.current = initialDraft;
		setDraft(initialDraft);
		setIsOpen(false);
	};

	const isCommitDisabled = buildPayloadFromDraft(draft) === null;

	return (
		<SetPlanRowFrame index={index}>
			<SetPlanRowEditTrigger
				title={setName}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				onCommit={handleCommit}
				isCommitDisabled={isCommitDisabled}
				affordanceLabel="セットを設定"
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
			<SetPlanRowDeleteButton label={`${setName}を削除`} onPress={onDelete} />
		</SetPlanRowFrame>
	);
};

const initialDraft: Draft = {
	kind: "weight-x-reps",
	weight: null,
	reps: null,
	rpe: null,
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
