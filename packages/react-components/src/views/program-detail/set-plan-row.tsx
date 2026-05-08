"use client";

import {
	CheckIcon,
	PencilSquareIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { type FC, type FormEvent, type KeyboardEvent, useState } from "react";
import { cn } from "../../libs/utils";
import { Button } from "../../primitives/button";
import { Menu, MenuItem, MenuTrigger } from "../../primitives/menu";
import {
	NumberField,
	NumberFieldInput,
	NumberFieldLabel,
} from "../../primitives/number-field";

type Params =
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

type Props = {
	index: number;
	params: Params | null;
	weightUnit: "kg" | "lbs";
	weightStep?: number;
	repsStep?: number;
	onChange?: (params: Params) => void;
};

export const SetPlanRow: FC<Props> = ({
	index,
	params,
	weightUnit,
	weightStep = 2.5,
	repsStep = 1,
	onChange,
}) => {
	const [draft, setDraft] = useState<Draft | null>(null);
	const isEditing = draft !== null;
	const isEditable = onChange !== undefined;

	const startEditing = () => {
		setDraft(paramsToDraft(params));
	};

	const cancelEditing = () => {
		setDraft(null);
	};

	const submitEditing = () => {
		if (draft === null) return;
		const finalParams = draftToParams(draft);
		if (finalParams === null) return;
		onChange?.(finalParams);
		setDraft(null);
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submitEditing();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			cancelEditing();
		}
	};

	if (isEditing) {
		return (
			// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape キーでキャンセルするため form 要素に onKeyDown が必要
			<form
				onSubmit={handleSubmit}
				onKeyDown={handleKeyDown}
				className="flex flex-col gap-3 rounded-md border border-border bg-overlay p-3"
				aria-label={`セット ${index + 1} を編集`}
			>
				<div className="flex items-center justify-between gap-2">
					<span className="text-muted-fg text-xs tabular-nums">
						{`#${index + 1}`}
					</span>
					<MenuTrigger>
						<Button intent="plain" size="sm" type="button">
							<span>{patternLabel(draft.pattern)}</span>
							<ChevronDownIcon
								data-slot="icon"
								className="size-4"
								aria-hidden
							/>
						</Button>
						<Menu aria-label="パターンを切り替え">
							<MenuItem
								onAction={() => setDraft(emptyDraftFor("weight-x-reps"))}
							>
								重量 × 回数
							</MenuItem>
							<MenuItem
								onAction={() => setDraft(emptyDraftFor("weight-x-rpe"))}
							>
								重量 × RPE
							</MenuItem>
							<MenuItem onAction={() => setDraft(emptyDraftFor("reps-x-rpe"))}>
								回数 × RPE
							</MenuItem>
						</Menu>
					</MenuTrigger>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							intent="plain"
							size="sq-sm"
							onPress={cancelEditing}
							aria-label="キャンセル"
						>
							<XMarkIcon data-slot="icon" className="size-5" aria-hidden />
						</Button>
						<Button
							type="submit"
							intent="primary"
							size="sq-sm"
							isDisabled={draftToParams(draft) === null}
							aria-label="確定"
						>
							<CheckIcon data-slot="icon" className="size-5" aria-hidden />
						</Button>
					</div>
				</div>
				<DraftFields
					draft={draft}
					weightUnit={weightUnit}
					weightStep={weightStep}
					repsStep={repsStep}
					onUpdate={setDraft}
				/>
			</form>
		);
	}

	const isEmpty = params === null;
	return (
		<div className="flex items-baseline gap-3 px-3 py-2 text-sm">
			<span className="w-8 shrink-0 text-muted-fg text-xs tabular-nums">
				{`#${index + 1}`}
			</span>
			<span
				className={cn(
					"flex-1 tabular-nums",
					isEmpty ? "text-muted-fg" : "text-fg",
				)}
			>
				{formatParams(params, weightUnit)}
			</span>
			{isEditable && (
				<Button
					type="button"
					intent="plain"
					size="sq-xs"
					onPress={startEditing}
					aria-label={`セット ${index + 1} を編集`}
				>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			)}
		</div>
	);
};

type Pattern = Params["pattern"];

type Draft =
	| { pattern: "weight-x-reps"; weight: number | null; reps: number | null }
	| { pattern: "weight-x-rpe"; weight: number | null; rpe: number | null }
	| { pattern: "reps-x-rpe"; reps: number | null; rpe: number | null };

type DraftFieldsProps = {
	draft: Draft;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	repsStep: number;
	onUpdate: (draft: Draft) => void;
};

const DraftFields: FC<DraftFieldsProps> = ({
	draft,
	weightUnit,
	weightStep,
	repsStep,
	onUpdate,
}) => {
	switch (draft.pattern) {
		case "weight-x-reps":
			return (
				<div className="flex items-end gap-3">
					<NumberField
						value={draft.weight ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, weight: normalizeNumber(value) })
						}
						step={weightStep}
						minValue={0}
					>
						<NumberFieldLabel>{`重量 (${weightUnit})`}</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<span className="pb-2 text-fg text-sm">×</span>
					<NumberField
						value={draft.reps ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, reps: normalizeNumber(value) })
						}
						step={repsStep}
						minValue={0}
					>
						<NumberFieldLabel>回数</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
				</div>
			);
		case "weight-x-rpe":
			return (
				<div className="flex items-end gap-3">
					<NumberField
						value={draft.weight ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, weight: normalizeNumber(value) })
						}
						step={weightStep}
						minValue={0}
					>
						<NumberFieldLabel>{`重量 (${weightUnit})`}</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<span className="pb-2 text-fg text-sm">@</span>
					<NumberField
						value={draft.rpe ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, rpe: normalizeNumber(value) })
						}
						step={0.5}
						minValue={0}
						maxValue={10}
					>
						<NumberFieldLabel>RPE</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
				</div>
			);
		case "reps-x-rpe":
			return (
				<div className="flex items-end gap-3">
					<NumberField
						value={draft.reps ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, reps: normalizeNumber(value) })
						}
						step={repsStep}
						minValue={0}
					>
						<NumberFieldLabel>回数</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<span className="pb-2 text-fg text-sm">@</span>
					<NumberField
						value={draft.rpe ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, rpe: normalizeNumber(value) })
						}
						step={0.5}
						minValue={0}
						maxValue={10}
					>
						<NumberFieldLabel>RPE</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
				</div>
			);
	}
};

const normalizeNumber = (value: number): number | null =>
	Number.isNaN(value) ? null : value;

const patternLabel = (pattern: Pattern): string => {
	switch (pattern) {
		case "weight-x-reps":
			return "重量 × 回数";
		case "weight-x-rpe":
			return "重量 × RPE";
		case "reps-x-rpe":
			return "回数 × RPE";
	}
};

const emptyDraftFor = (pattern: Pattern): Draft => {
	switch (pattern) {
		case "weight-x-reps":
			return { pattern, weight: null, reps: null };
		case "weight-x-rpe":
			return { pattern, weight: null, rpe: null };
		case "reps-x-rpe":
			return { pattern, reps: null, rpe: null };
	}
};

const paramsToDraft = (params: Params | null): Draft => {
	if (params === null) {
		return emptyDraftFor("weight-x-reps");
	}
	return params;
};

const draftToParams = (draft: Draft): Params | null => {
	switch (draft.pattern) {
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
			return {
				pattern: "reps-x-rpe",
				reps: draft.reps,
				rpe: draft.rpe,
			};
	}
};

const formatWeight = (weight: number, unit: "kg" | "lbs"): string =>
	`${weight}${unit}`;

const formatReps = (reps: number): string => `${reps}回`;

const formatRpe = (rpe: number): string => `RPE ${rpe}`;

const formatParams = (params: Params | null, unit: "kg" | "lbs"): string => {
	if (params === null) {
		return "値未入力";
	}
	switch (params.pattern) {
		case "weight-x-reps":
			return `${formatWeight(params.weight, unit)} × ${formatReps(params.reps)}`;
		case "weight-x-rpe":
			return `${formatWeight(params.weight, unit)} @ ${formatRpe(params.rpe)}`;
		case "reps-x-rpe":
			return `${formatReps(params.reps)} @ ${formatRpe(params.rpe)}`;
	}
};
