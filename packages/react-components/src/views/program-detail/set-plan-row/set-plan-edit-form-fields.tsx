"use client";

import type { FC } from "react";
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
import type { WeightUnit } from "../set-plan-types";

type WeightFieldProps = {
	value: number | null;
	onChange: (value: number | null) => void;
	weightUnit: WeightUnit;
	weightStep: number;
};

// React Aria の NumberField は「空入力」を NaN で表現する（state 初期値も NaN）。
// exactOptionalPropertyTypes 下では value: undefined を渡せないため、null は NaN で送り出す。
export const WeightField: FC<WeightFieldProps> = ({
	value,
	onChange,
	weightUnit,
	weightStep,
}) => (
	<NumberField
		value={value ?? Number.NaN}
		onChange={(v) => onChange(Number.isNaN(v) ? null : v)}
		step={weightStep}
		minValue={0}
		className={fieldLayout}
	>
		<NumberFieldLabel>{`重量 (${weightUnit})`}</NumberFieldLabel>
		<NumberFieldInput />
	</NumberField>
);

type RepsFieldProps = {
	value: number | null;
	onChange: (value: number | null) => void;
};

export const RepsField: FC<RepsFieldProps> = ({ value, onChange }) => (
	<NumberField
		value={value ?? Number.NaN}
		onChange={(v) => onChange(Number.isNaN(v) ? null : v)}
		step={1}
		minValue={0}
		className={fieldLayout}
	>
		<NumberFieldLabel>回数</NumberFieldLabel>
		<NumberFieldInput />
	</NumberField>
);

type RpeFieldProps = {
	value: number | null;
	onChange: (value: number | null) => void;
};

export const RpeField: FC<RpeFieldProps> = ({ value, onChange }) => (
	<div className={fieldLayout}>
		<span
			data-slot="label"
			className="block select-none font-medium text-base/6 text-fg sm:text-sm/6"
		>
			RPE
		</span>
		<ScrollArea scrollAlign="center">
			<SingleToggleButtonGroup
				aria-label="RPE"
				selectedKey={value === null ? null : value.toString()}
				onSelectionChange={(key) => onChange(key === null ? null : Number(key))}
				// NumberField の Group（border 込み 42px）と高さを揃え、Tabs 切替時の
				// フォーム高さ差を消すために min-h-[2.625rem] を指定。items-center で
				// ToggleButton 自体（min-h-9 / sm:min-h-8）を垂直中央に置く
				className="flex w-fit items-center gap-1 min-h-[2.625rem]"
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

const fieldLayout =
	"grid grid-cols-[5rem_1fr] items-center gap-3 [&>[data-slot=label]+[data-slot=control]]:mt-0";

const RPE_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const;
