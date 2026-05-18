import type { FC } from "react";
import {
	SingleToggleButtonGroup,
	ToggleButton,
} from "../../../../primitives/toggle-button-group";
import { fieldLayout } from "./field-layout";

type Props = {
	value: number | null;
	onChange: (value: number | null) => void;
};

export const RpeField: FC<Props> = ({ value, onChange }) => (
	<div className={fieldLayout}>
		{/* TODO(#799): NumberFieldLabel と同じ base styling を手書きでコピーしている。Label primitive 新設時に置き換える */}
		<span
			data-slot="label"
			className="block select-none font-medium text-base/6 text-fg sm:text-sm/6"
		>
			RPE
		</span>
		<SingleToggleButtonGroup
			aria-label="RPE"
			selectedKey={value === null ? null : value.toString()}
			onSelectionChange={(key) => onChange(key === null ? null : Number(key))}
			className="flex flex-wrap gap-1.5"
		>
			{[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rpe) => (
				<ToggleButton
					key={rpe}
					id={rpe.toString()}
					className="min-h-10 min-w-12 px-3 text-base sm:min-h-10 sm:text-base"
				>
					{rpe}
				</ToggleButton>
			))}
		</SingleToggleButtonGroup>
	</div>
);
