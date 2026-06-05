import type { FC } from "react";
import { ExerciseSelectorComboBox } from "./exercise-selector-combo-box";
import { ExerciseSelectorDrawer } from "./exercise-selector-drawer";

type Props = {
	exercises: { id: string; name: string }[];
	selectedExerciseId?: string;
	onSelect: (exerciseId: string) => void;
	onCreateExercise: (name: string) => void;
	label: string;
	isDisabled?: boolean;
};

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
