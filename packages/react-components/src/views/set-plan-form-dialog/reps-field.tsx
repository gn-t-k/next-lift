"use client";

import type { FC } from "react";
import { Label } from "../../primitives/label";
import { NumberField, NumberFieldInput } from "../../primitives/number-field";
import { fieldLayout } from "./field-layout";

type Props = {
	value: number | null;
	onChange: (value: number | null) => void;
};

// React Aria の NumberField は「空入力」を NaN で表現する（state 初期値も NaN）。
// exactOptionalPropertyTypes 下では value: undefined を渡せないため、null は NaN で送り出す。
export const RepsField: FC<Props> = ({ value, onChange }) => (
	<NumberField
		value={value ?? Number.NaN}
		onChange={(v) => onChange(Number.isNaN(v) ? null : v)}
		step={1}
		minValue={0}
		className={fieldLayout}
	>
		<Label>回数</Label>
		<NumberFieldInput />
	</NumberField>
);
