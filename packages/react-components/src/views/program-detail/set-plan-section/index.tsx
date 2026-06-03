import type { FC } from "react";
import type { WeightUnit } from "../weight-unit";
import { SetPlanAddTriggerButton } from "./set-plan-add-trigger-button";
import { SetPlanFormDialog } from "./set-plan-form-dialog";
import { SetPlanQuickAddButton } from "./set-plan-quick-add-button";
import { SetPlanRow } from "./set-plan-row";
import type { SetPlan, SetPlanDraft } from "./set-plan-types";

type Props = {
	setPlans: SetPlan[];
	weightUnit: WeightUnit;
	weightStep: number;
	exerciseName: string;
	onAddSetPlan: (payload: SetPlanDraft) => void;
	onChangeSetPlan: (setPlanId: SetPlan["id"], payload: SetPlanDraft) => void;
	onDeleteSetPlan: (setPlanId: SetPlan["id"]) => void;
	autoFocusAddTrigger?: boolean | undefined;
};

export const SetPlanSection: FC<Props> = ({
	setPlans,
	weightUnit,
	weightStep,
	exerciseName,
	onAddSetPlan,
	onChangeSetPlan,
	onDeleteSetPlan,
	autoFocusAddTrigger,
}) => {
	const lastSetPlan = setPlans[setPlans.length - 1];

	if (lastSetPlan === undefined) {
		return (
			<div className="flex flex-col">
				<SetPlanFormDialog
					title={`${exerciseName} 1セット目を追加`}
					trigger={<SetPlanAddTriggerButton autoFocus={autoFocusAddTrigger} />}
					initial={undefined}
					weightUnit={weightUnit}
					weightStep={weightStep}
					onSubmit={onAddSetPlan}
				/>
			</div>
		);
	}

	const lastSetPlanDraft = (() => {
		const { id: _, ...rest } = lastSetPlan;
		return rest;
	})();

	return (
		<div className="flex flex-col">
			<ol className="flex flex-col">
				{setPlans.map((setPlan, index) => (
					<li key={setPlan.id}>
						<SetPlanRow
							setPlan={setPlan}
							index={index}
							weightUnit={weightUnit}
							weightStep={weightStep}
							exerciseName={exerciseName}
							onChange={onChangeSetPlan}
							onDelete={onDeleteSetPlan}
						/>
					</li>
				))}
			</ol>
			<SetPlanQuickAddButton
				lastSetPlanDraft={lastSetPlanDraft}
				nextIndex={setPlans.length}
				weightUnit={weightUnit}
				onClick={onAddSetPlan}
			/>
		</div>
	);
};
