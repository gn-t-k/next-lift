"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { type FC, type FormEvent, useState } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { cx } from "../../libs/primitive";
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

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) cancelEditing();
	};

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
				<DialogTrigger isOpen={isEditing} onOpenChange={handleOpenChange}>
					<Button
						intent="plain"
						size="sq-xs"
						onPress={startEditing}
						aria-label={`セット ${index + 1} を編集`}
					>
						<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
					</Button>
					<Popover
						placement="bottom end"
						className={cx(
							"max-w-[min(20rem,calc(100vw-2rem))]",
							"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
							"entering:fade-in entering:animate-in entering:duration-150",
							"exiting:fade-out exiting:animate-out exiting:duration-100",
						)}
					>
						<Dialog
							className="outline-hidden"
							aria-label={`セット ${index + 1} を編集`}
						>
							{draft !== null && (
								<form
									onSubmit={handleSubmit}
									className="flex w-72 flex-col gap-3 p-3"
								>
									<DraftFields
										draft={draft}
										weightUnit={weightUnit}
										weightStep={weightStep}
										repsStep={repsStep}
										onUpdate={setDraft}
									/>
									<footer className="flex items-center justify-between gap-2">
										<MenuTrigger>
											<Button intent="plain" size="sm" type="button">
												<span>{patternLabel(draft.pattern)}</span>
												<ChevronDownIcon
													data-slot="icon"
													className="size-4"
													aria-hidden
												/>
											</Button>
											<Menu
												aria-label="パターンを切り替え"
												selectionMode="single"
												selectedKeys={[draft.pattern]}
											>
												{PATTERN_OPTIONS.map((option) => (
													<MenuItem
														key={option.pattern}
														id={option.pattern}
														onAction={() =>
															setDraft(emptyDraftFor(option.pattern))
														}
													>
														<span className="flex-1">{option.label}</span>
														<CheckIcon
															className="size-4 in-data-selected:opacity-100 opacity-0"
															aria-hidden
														/>
													</MenuItem>
												))}
											</Menu>
										</MenuTrigger>
										<div className="flex items-center gap-2">
											<Button
												type="button"
												intent="plain"
												size="sm"
												onPress={cancelEditing}
											>
												キャンセル
											</Button>
											<Button
												type="submit"
												intent="primary"
												size="sm"
												isDisabled={draftToParams(draft) === null}
											>
												確定
											</Button>
										</div>
									</footer>
								</form>
							)}
						</Dialog>
					</Popover>
				</DialogTrigger>
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

const fieldLayout =
	"grid grid-cols-[5rem_1fr] items-center gap-3 [&>[data-slot=label]+[data-slot=control]]:mt-0";

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
				<div className="flex flex-col gap-3">
					<NumberField
						value={draft.weight ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, weight: normalizeNumber(value) })
						}
						step={weightStep}
						minValue={0}
						className={fieldLayout}
					>
						<NumberFieldLabel>{`重量 (${weightUnit})`}</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<NumberField
						value={draft.reps ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, reps: normalizeNumber(value) })
						}
						step={repsStep}
						minValue={0}
						className={fieldLayout}
					>
						<NumberFieldLabel>回数</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
				</div>
			);
		case "weight-x-rpe":
			return (
				<div className="flex flex-col gap-3">
					<NumberField
						value={draft.weight ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, weight: normalizeNumber(value) })
						}
						step={weightStep}
						minValue={0}
						className={fieldLayout}
					>
						<NumberFieldLabel>{`重量 (${weightUnit})`}</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<NumberField
						value={draft.rpe ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, rpe: normalizeNumber(value) })
						}
						step={0.5}
						minValue={5}
						maxValue={10}
						className={fieldLayout}
					>
						<NumberFieldLabel>RPE</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
				</div>
			);
		case "reps-x-rpe":
			return (
				<div className="flex flex-col gap-3">
					<NumberField
						value={draft.reps ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, reps: normalizeNumber(value) })
						}
						step={repsStep}
						minValue={0}
						className={fieldLayout}
					>
						<NumberFieldLabel>回数</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<NumberField
						value={draft.rpe ?? Number.NaN}
						onChange={(value) =>
							onUpdate({ ...draft, rpe: normalizeNumber(value) })
						}
						step={0.5}
						minValue={5}
						maxValue={10}
						className={fieldLayout}
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

const PATTERN_OPTIONS: { pattern: Pattern; label: string }[] = [
	{ pattern: "weight-x-reps", label: "重量 × 回数" },
	{ pattern: "weight-x-rpe", label: "重量 × RPE" },
	{ pattern: "reps-x-rpe", label: "回数 × RPE" },
];

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
