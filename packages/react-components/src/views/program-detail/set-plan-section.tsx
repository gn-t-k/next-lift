import type { ComponentProps, FC } from "react";
import { SetPlanRow } from "./set-plan-row";

type Params = ComponentProps<typeof SetPlanRow>["params"];

type Props = {
	setPlans: { id: string; params: Params }[];
	weightUnit: "kg" | "lbs";
};

export const SetPlanSection: FC<Props> = ({ setPlans, weightUnit }) => {
	if (setPlans.length === 0) return null;
	return (
		<ol className="flex flex-col">
			{setPlans.map((setPlan, index) => (
				<li key={setPlan.id}>
					<SetPlanRow
						index={index}
						params={setPlan.params}
						weightUnit={weightUnit}
					/>
				</li>
			))}
		</ol>
	);
};
