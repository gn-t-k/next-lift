"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import { type SubmitEvent, useId, useState } from "react";
import type { Key } from "react-aria-components";
import { useMediaQuery } from "../../../libs";
import { Button } from "../../../primitives/button";
import { ResponsiveDialog } from "../../../primitives/responsive-dialog";
import { Tab, TabList, TabPanel, Tabs } from "../../../primitives/tabs";
import type { SetPlan, SetPlanDraft, WeightUnit } from "./build-set-plan-draft";
import { RepsField } from "./reps-field";
import { RpeField } from "./rpe-field";
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

const setPlanPatterns = [
	"weight-reps",
	"weight-rpe",
	"reps-rpe",
] satisfies readonly SetPlan["pattern"][];

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
	} satisfies Record<SetPlan["pattern"], string>;

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
	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		handleCommit();
	};

	const handlePatternChange = (key: Key) => {
		const pattern = setPlanPatterns.find(
			(candidate) => tabIds[candidate] === key,
		);
		if (pattern === undefined) return;
		formActions.setPattern(pattern);
	};

	// 本来は Tailwind の breakpoint（--breakpoint-md）から参照すべきだが、一時的にベタ書きしている
	const desktopViewport = useMediaQuery("(min-width: 768px)");

	return (
		<ResponsiveDialog
			title={title}
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			desktopViewport={desktopViewport}
			popoverWidth="default"
		>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-3"
				aria-label={title}
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
				<div className="flex justify-end">
					<Button
						type="submit"
						intent="primary"
						size="sm"
						isDisabled={form.isCommitDisabled}
						className="[--btn-icon:var(--btn-fg)]"
					>
						<CheckIcon data-slot="icon" className="size-4" aria-hidden />
						確定
					</Button>
				</div>
			</form>
		</ResponsiveDialog>
	);
};
