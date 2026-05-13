"use client";

import type { FC, ReactNode } from "react";
import { useId, useRef, useState } from "react";
import type { Key } from "react-aria-components";
import { useMediaQuery } from "../../../libs";
import { Tab, TabList, TabPanel, Tabs } from "../../../primitives/tabs";
import type { Pattern, SetPlanWithParams, WeightUnit } from "../set-plan-types";
import {
	buildPayloadFromDraft,
	type Draft,
	makeInitialDraft,
} from "./build-payload-from-draft";
import { RepsField, RpeField, WeightField } from "./set-plan-edit-form-fields";
import { SetPlanRowDrawer } from "./set-plan-row-drawer";
import { SetPlanRowPopover } from "./set-plan-row-popover";

const MD_BREAKPOINT = "(min-width: 768px)";

type Props = {
	title: string;
	trigger: ReactNode;
	initial: SetPlanWithParams | undefined;
	weightUnit: WeightUnit;
	weightStep: number;
	onSubmit: (payload: SetPlanWithParams) => void;
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
	} as const satisfies Record<Pattern, string>;

	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Draft>(() => makeInitialDraft(initial));
	// blur で更新された draft を同一ハンドラ内で同期的に読むため、ref に持つ
	const draftRef = useRef<Draft>(makeInitialDraft(initial));

	const writeDraft = (next: Draft) => {
		draftRef.current = next;
		setDraft(next);
	};

	const resetDraft = () => {
		const init = makeInitialDraft(initial);
		draftRef.current = init;
		setDraft(init);
	};

	const blurActiveInput = () => {
		if (document.activeElement instanceof HTMLInputElement) {
			document.activeElement.blur();
		}
	};

	const handleOpenChange = (open: boolean) => {
		resetDraft();
		setIsOpen(open);
	};

	const handleCommit = () => {
		// 確定ボタンのマウスクリックでも focused input の blur が発火しないため、
		// 明示的に blur して NumberField の値を commit させてから payload を組む
		blurActiveInput();
		const payload = buildPayloadFromDraft(draftRef.current);
		if (payload !== null) {
			onSubmit(payload);
		}
		resetDraft();
		setIsOpen(false);
	};

	const isCommitDisabled = buildPayloadFromDraft(draft) === null;

	const isMdUp = useMediaQuery(MD_BREAKPOINT);
	if (isMdUp === null) {
		// SSR / 初回マウント時は DialogTrigger 未マウントなので、押しても開かないが
		// レイアウトを保つためにトリガー要素だけ描画する
		return <>{trigger}</>;
	}
	const Variant = isMdUp ? SetPlanRowPopover : SetPlanRowDrawer;

	return (
		<Variant
			title={title}
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			onCommit={handleCommit}
			isCommitDisabled={isCommitDisabled}
		>
			<Tabs
				selectedKey={tabIds[draft.pattern]}
				onSelectionChange={(key) => {
					// Tab マウスクリックでも focused input の blur が発火しないため、
					// TabPanel が unmount される前に明示的に blur して値を commit させる
					blurActiveInput();
					const pattern = toPattern(key, tabIds);
					if (pattern === undefined) return;
					writeDraft({ ...draftRef.current, pattern });
				}}
			>
				<TabList aria-label="セットの種類">
					<Tab id={tabIds["weight-reps"]}>重量×回数</Tab>
					<Tab id={tabIds["weight-rpe"]}>重量×RPE</Tab>
					<Tab id={tabIds["reps-rpe"]}>回数×RPE</Tab>
				</TabList>
				<TabPanel id={tabIds["weight-reps"]}>
					<div className="flex flex-col gap-3 pt-3">
						<WeightField
							value={draft.weight}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, weight: next })
							}
							weightUnit={weightUnit}
							weightStep={weightStep}
						/>
						<RepsField
							value={draft.reps}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, reps: next })
							}
						/>
					</div>
				</TabPanel>
				<TabPanel id={tabIds["weight-rpe"]}>
					<div className="flex flex-col gap-3 pt-3">
						<WeightField
							value={draft.weight}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, weight: next })
							}
							weightUnit={weightUnit}
							weightStep={weightStep}
						/>
						<RpeField
							value={draft.rpe}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, rpe: next })
							}
						/>
					</div>
				</TabPanel>
				<TabPanel id={tabIds["reps-rpe"]}>
					<div className="flex flex-col gap-3 pt-3">
						<RepsField
							value={draft.reps}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, reps: next })
							}
						/>
						<RpeField
							value={draft.rpe}
							onChange={(next) =>
								writeDraft({ ...draftRef.current, rpe: next })
							}
						/>
					</div>
				</TabPanel>
			</Tabs>
		</Variant>
	);
};

const toPattern = (
	key: Key,
	tabIds: Record<Pattern, string>,
): Pattern | undefined =>
	(Object.entries(tabIds) as [Pattern, string][]).find(
		([, id]) => id === key,
	)?.[0];
