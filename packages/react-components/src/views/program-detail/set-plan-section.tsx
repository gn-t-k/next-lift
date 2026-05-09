import type { ComponentProps, FC } from "react";
import { SetPlanRow } from "./set-plan-row";

type Pattern = ComponentProps<typeof SetPlanRow>["pattern"];

type Props = {
	setPlans: { id: string; pattern: Pattern }[];
	weightUnit: "kg" | "lbs";
	weightStep: number;
	exerciseName: string;
	onSetPlanChange: (setPlanId: string, pattern: NonNullable<Pattern>) => void;
};

export const SetPlanSection: FC<Props> = ({
	setPlans,
	weightUnit,
	weightStep,
	exerciseName,
	onSetPlanChange,
}) => {
	if (setPlans.length === 0) return null;
	return (
		<ol className="flex flex-col">
			{setPlans.map((setPlan, index) => (
				<li key={setPlan.id}>
					<SetPlanRow
						index={index}
						pattern={setPlan.pattern}
						weightUnit={weightUnit}
						weightStep={weightStep}
						exerciseName={exerciseName}
						onChange={(pattern) => onSetPlanChange(setPlan.id, pattern)}
					/>
				</li>
			))}
		</ol>
	);
};
