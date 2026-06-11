"use client";

import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { useState } from "react";
import { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { Label } from "../../primitives/label";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { TextArea } from "../../primitives/text-area";
import { TextField } from "../../primitives/text-field";
import type { ExercisePlan } from "./exercise-plan-list";

export type ExercisePlanMemoPayload = { memo: string };

type Props = {
	exercisePlan: ExercisePlan;
	onChange: (exercisePlanId: string, payload: ExercisePlanMemoPayload) => void;
};

export const ExercisePlanMemoDialogButton: FC<Props> = ({
	exercisePlan,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [draftMemo, setDraftMemo] = useState<string | undefined>(undefined);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = `${exercisePlan.exercise.name}のメモを編集`;
	const memo = draftMemo ?? exercisePlan.memo ?? "";

	const close = () => {
		setDraftMemo(undefined);
		setIsOpen(false);
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			setIsOpen(true);
			return;
		}
		close();
	};

	return (
		<ResponsiveDialog
			title={title}
			trigger={
				<Button
					intent="plain"
					size="sq-xs"
					aria-label={title}
					className="shrink-0"
				>
					<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
				</Button>
			}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
			desktopViewport={desktopViewport}
			popoverWidth="default"
		>
			<form
				className="flex flex-col gap-3"
				onSubmit={(event) => {
					event.preventDefault();
					const nextMemo = memo.trim();
					onChange(exercisePlan.id, {
						memo: nextMemo,
					});
					close();
				}}
			>
				<TextField value={memo} onChange={setDraftMemo}>
					<Label>メモ</Label>
					<TextArea rows={3} />
				</TextField>
				<div className="flex justify-end gap-2">
					<Button type="button" intent="plain" size="sm" onPress={close}>
						キャンセル
					</Button>
					<Button
						type="submit"
						intent="primary"
						size="sm"
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
