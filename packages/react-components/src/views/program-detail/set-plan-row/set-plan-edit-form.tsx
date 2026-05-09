"use client";

import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { FC, FormEvent } from "react";
import { Button } from "../../../primitives/button";
import { Menu, MenuItem, MenuTrigger } from "../../../primitives/menu";
import {
	NumberField,
	NumberFieldInput,
	NumberFieldLabel,
} from "../../../primitives/number-field";
import { ScrollArea } from "../../../primitives/scrollable";
import {
	SingleToggleButtonGroup,
	ToggleButton,
} from "../../../primitives/toggle-button-group";
import {
	type Draft,
	draftToPattern,
	emptyDraftFor,
	normalizeNumber,
	type SetPlanPatternKind,
} from "./use-set-plan-editing";

type Props = {
	draft: Draft;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	onUpdate: (draft: Draft) => void;
	onSubmit: () => void;
	className?: string;
};

export const SetPlanEditForm: FC<Props> = ({
	draft,
	weightUnit,
	weightStep,
	onUpdate,
	onSubmit,
	className,
}) => {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit();
	};
	return (
		<form
			onSubmit={handleSubmit}
			className={`flex flex-col gap-3 ${className ?? ""}`}
		>
			<DraftFields
				draft={draft}
				weightUnit={weightUnit}
				weightStep={weightStep}
				onUpdate={onUpdate}
			/>
			<footer className="flex items-center justify-between gap-2">
				<MenuTrigger>
					<Button
						intent="plain"
						size="sq-sm"
						type="button"
						aria-label={`パターンを変更（現在: ${patternLabel(draft.kind)}）`}
					>
						<ArrowsRightLeftIcon
							data-slot="icon"
							className="size-4"
							aria-hidden
						/>
					</Button>
					<Menu
						aria-label="パターンを切り替え"
						placement="top start"
						selectionMode="single"
						selectedKeys={[draft.kind]}
					>
						{PATTERN_KINDS.map((kind) => (
							<MenuItem
								key={kind}
								id={kind}
								onAction={() => onUpdate(emptyDraftFor(kind))}
							>
								<span className="flex-1">{patternLabel(kind)}</span>
								<CheckIcon
									className="size-4 in-data-selected:opacity-100 opacity-0"
									aria-hidden
								/>
							</MenuItem>
						))}
					</Menu>
				</MenuTrigger>
				<Button
					type="submit"
					intent="primary"
					size="sq-sm"
					isDisabled={draftToPattern(draft) === null}
					aria-label="確定"
				>
					<CheckIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			</footer>
		</form>
	);
};

type DraftFieldsProps = {
	draft: Draft;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	onUpdate: (draft: Draft) => void;
};

const fieldLayout =
	"grid grid-cols-[5rem_1fr] items-center gap-3 [&>[data-slot=label]+[data-slot=control]]:mt-0";

const DraftFields: FC<DraftFieldsProps> = ({
	draft,
	weightUnit,
	weightStep,
	onUpdate,
}) => {
	switch (draft.kind) {
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
						step={1}
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
					<RpeToggleField
						value={draft.rpe}
						onChange={(rpe) => onUpdate({ ...draft, rpe })}
					/>
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
						step={1}
						minValue={0}
						className={fieldLayout}
					>
						<NumberFieldLabel>回数</NumberFieldLabel>
						<NumberFieldInput placeholder="未入力" />
					</NumberField>
					<RpeToggleField
						value={draft.rpe}
						onChange={(rpe) => onUpdate({ ...draft, rpe })}
					/>
				</div>
			);
	}
};

type RpeToggleFieldProps = {
	value: number | null;
	onChange: (value: number | null) => void;
};

const RpeToggleField: FC<RpeToggleFieldProps> = ({ value, onChange }) => (
	<div className={fieldLayout}>
		<span
			data-slot="label"
			className="block select-none font-medium text-base/6 text-fg sm:text-sm/6"
		>
			RPE
		</span>
		<ScrollArea>
			<SingleToggleButtonGroup
				aria-label="RPE"
				selectedKey={value === null ? null : value.toString()}
				onSelectionChange={(key) => onChange(key === null ? null : Number(key))}
				className="flex w-fit gap-1"
			>
				{RPE_OPTIONS.map((rpe) => (
					<ToggleButton
						key={rpe}
						id={rpe.toString()}
						data-initial-scroll={value === rpe ? "" : undefined}
					>
						{rpe}
					</ToggleButton>
				))}
			</SingleToggleButtonGroup>
		</ScrollArea>
	</div>
);

const RPE_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const;

const PATTERN_KINDS = [
	"weight-x-reps",
	"weight-x-rpe",
	"reps-x-rpe",
] as const satisfies readonly SetPlanPatternKind[];

const patternLabel = (kind: SetPlanPatternKind): string => {
	switch (kind) {
		case "weight-x-reps":
			return "重量 × 回数";
		case "weight-x-rpe":
			return "重量 × RPE";
		case "reps-x-rpe":
			return "回数 × RPE";
	}
};
