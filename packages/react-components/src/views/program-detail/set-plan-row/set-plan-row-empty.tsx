"use client";

import type { FC } from "react";
import { useRef, useState } from "react";
import {
	SingleToggleButtonGroup,
	ToggleButton,
} from "../../../primitives/toggle-button-group";
import type { Pattern } from "../set-plan-types";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowEditTrigger } from "./set-plan-row-edit-trigger";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Props = {
	index: number;
	exerciseName: string;
	onSelectKind: (kind: Pattern) => void;
	onDelete: () => void;
};

export const SetPlanRowEmpty: FC<Props> = ({
	index,
	exerciseName,
	onSelectKind,
	onDelete,
}) => {
	const title = `${exerciseName} ${index + 1}セット目`;
	const [isOpen, setIsOpen] = useState(false);
	const [draft, setDraft] = useState<Pattern | null>(null);
	const draftRef = useRef<Pattern | null>(null);

	const writeDraft = (next: Pattern | null) => {
		draftRef.current = next;
		setDraft(next);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			writeDraft(null);
		}
		setIsOpen(open);
	};

	const handleCommit = () => {
		const current = draftRef.current;
		if (current !== null) {
			onSelectKind(current);
		}
		writeDraft(null);
		setIsOpen(false);
	};

	return (
		<SetPlanRowFrame index={index}>
			<span className="flex-1 text-muted-fg">値未入力</span>
			<SetPlanRowEditTrigger
				title={title}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				onCommit={handleCommit}
				isCommitDisabled={draft === null}
			>
				<SingleToggleButtonGroup
					aria-label="セットの種類"
					selectedKey={draft}
					onSelectionChange={(key) =>
						writeDraft(key === null ? null : (key as Pattern))
					}
					className="flex flex-col gap-1"
				>
					{KIND_OPTIONS.map((option) => (
						<ToggleButton
							key={option.kind}
							id={option.kind}
							className="w-full justify-start"
						>
							{option.label}
						</ToggleButton>
					))}
				</SingleToggleButtonGroup>
			</SetPlanRowEditTrigger>
			<SetPlanRowDeleteButton
				label={`${exerciseName} ${index + 1}セット目を削除`}
				onPress={onDelete}
			/>
		</SetPlanRowFrame>
	);
};

const KIND_OPTIONS: { kind: Pattern; label: string }[] = [
	{ kind: "weight-x-reps", label: "重量 × 回数" },
	{ kind: "weight-x-rpe", label: "重量 × RPE" },
	{ kind: "reps-x-rpe", label: "回数 × RPE" },
];
