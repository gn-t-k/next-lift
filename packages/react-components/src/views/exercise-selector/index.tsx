import type { ComponentProps, FC } from "react";
import { ExerciseSelectorComboBox } from "../exercise-selector-combo-box";
import { ExerciseSelectorDrawer } from "./exercise-selector-drawer";

type Props = ComponentProps<typeof ExerciseSelectorComboBox>;

export const ExerciseSelector: FC<Props> = (props) => {
	return (
		<>
			<div className="md:hidden">
				<ExerciseSelectorDrawer {...props} />
			</div>
			<div className="hidden md:block">
				<ExerciseSelectorComboBox {...props} />
			</div>
		</>
	);
};
