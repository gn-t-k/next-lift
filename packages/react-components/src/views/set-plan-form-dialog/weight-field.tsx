"use client";

import type { FC } from "react";
import { Label } from "../../primitives/label";
import { NumberField, NumberFieldInput } from "../../primitives/number-field";
import type { WeightUnit } from "../weight-unit";
import { fieldLayout } from "./field-layout";

type Props = {
	value: number | null;
	onChange: (value: number | null) => void;
	weightUnit: WeightUnit;
	weightStep: number;
};

// React Aria の NumberField は「空入力」を NaN で表現する（state 初期値も NaN）。
// exactOptionalPropertyTypes 下では value: undefined を渡せないため、null は NaN で送り出す。
export const WeightField: FC<Props> = ({
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
		<Label>{`重量 (${weightUnit})`}</Label>
		<NumberFieldInput />
	</NumberField>
);
