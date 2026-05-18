"use client";

import type { FC, ReactNode } from "react";
import { useId, useState } from "react";
import type { Key } from "react-aria-components";
import { useMediaQuery } from "../../../../libs";
import { Tab, TabList, TabPanel, Tabs } from "../../../../primitives/tabs";
import type { WeightUnit } from "../../weight-unit";
import type { SetPlan, SetPlanDraft } from "../set-plan-types";
import { RepsField } from "./reps-field";
import { RpeField } from "./rpe-field";
import { SetPlanFormDialogDrawer } from "./set-plan-form-dialog-drawer";
import { SetPlanFormDialogPopover } from "./set-plan-form-dialog-popover";
import { useSetPlanForm } from "./use-set-plan-form";
import { WeightField } from "./weight-field";

type Props = {
	title: string;
	trigger: ReactNode;
	initial: SetPlanDraft | undefined;
	weightUnit: WeightUnit;
	weightStep: number;
	onSubmit: (payload: SetPlanDraft) => void;
};

export const SetPlanFormDialog: FC<Props> = ({
	title,
	trigger,
	initial,
	weightUnit,
	weightStep,
	onSubmit,
}) => {
	const baseId = useId();
	const tabIds = {
		"weight-reps": `${baseId}-weight-reps`,
		"weight-rpe": `${baseId}-weight-rpe`,
		"reps-rpe": `${baseId}-reps-rpe`,
	} as const satisfies Record<SetPlan["pattern"], string>;

	const [isOpen, setIsOpen] = useState(false);
	const [form, formActions] = useSetPlanForm({ initial, onSubmit });

	const handleOpenChange = (open: boolean) => {
		formActions.reset();
		setIsOpen(open);
	};

	const handleCommit = () => {
		formActions.commit();
		setIsOpen(false);
	};

	const handlePatternChange = (key: Key) => {
		const pattern = (
			Object.entries(tabIds) as [SetPlan["pattern"], string][]
		).find(([, id]) => id === key)?.[0];
		if (pattern === undefined) return;
		formActions.setPattern(pattern);
	};

	// 本来は Tailwind の breakpoint（--breakpoint-md）から参照すべきだが、一時的にベタ書きしている
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	if (desktopViewport === "pending") {
		// SSR / 初回マウント時は DialogTrigger 未マウントなので押しても開かないが、レイアウトを保つためにトリガー要素だけ描画する
		return trigger;
	}
	const Variant =
		desktopViewport === "matched"
			? SetPlanFormDialogPopover
			: SetPlanFormDialogDrawer;

	return (
		<Variant
			title={title}
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			onCommit={handleCommit}
			isCommitDisabled={form.isCommitDisabled}
		>
			<Tabs
				selectedKey={tabIds[form.pattern]}
				onSelectionChange={handlePatternChange}
			>
				<TabList aria-label="セットの種類">
					<Tab id={tabIds["weight-reps"]}>重量×回数</Tab>
					<Tab id={tabIds["weight-rpe"]}>重量×RPE</Tab>
					<Tab id={tabIds["reps-rpe"]}>回数×RPE</Tab>
				</TabList>
				<TabPanel id={tabIds["weight-reps"]}>
					<div className="flex flex-col gap-3 pt-3">
						<WeightField
							value={form.weight}
							onChange={formActions.setWeight}
							weightUnit={weightUnit}
							weightStep={weightStep}
						/>
						<RepsField value={form.reps} onChange={formActions.setReps} />
					</div>
				</TabPanel>
				<TabPanel id={tabIds["weight-rpe"]}>
					<div className="flex flex-col gap-3 pt-3">
						<WeightField
							value={form.weight}
							onChange={formActions.setWeight}
							weightUnit={weightUnit}
							weightStep={weightStep}
						/>
						<RpeField value={form.rpe} onChange={formActions.setRpe} />
					</div>
				</TabPanel>
				<TabPanel id={tabIds["reps-rpe"]}>
					<div className="flex flex-col gap-3 pt-3">
						<RepsField value={form.reps} onChange={formActions.setReps} />
						<RpeField value={form.rpe} onChange={formActions.setRpe} />
					</div>
				</TabPanel>
			</Tabs>
		</Variant>
	);
};
