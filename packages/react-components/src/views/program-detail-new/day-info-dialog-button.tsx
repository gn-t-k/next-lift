"use client";

import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { ComponentProps, FC } from "react";
import { useState } from "react";
import { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { Label } from "../../primitives/label";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";
import { TextArea } from "../../primitives/text-area";
import { TextField, TextFieldInput } from "../../primitives/text-field";
import type { ProgramDetailNew } from ".";

type Day = ComponentProps<typeof ProgramDetailNew>["days"][number];

type Props = {
	day: Day;
	onChange: (
		dayId: string,
		payload: { label: string; memo: string | null },
	) => void;
};

export const DayInfoDialogButton: FC<Props> = ({ day, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [draftLabel, setDraftLabel] = useState<string | null>(null);
	const [draftMemo, setDraftMemo] = useState<string | null>(null);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = `${day.label}を編集`;
	const label = draftLabel ?? day.label;
	const memo = draftMemo ?? day.memo ?? "";
	const nextLabel = label.trim();
	const isSubmitDisabled = nextLabel === "";

	const close = () => {
		setDraftLabel(null);
		setDraftMemo(null);
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
					if (isSubmitDisabled) return;
					const nextMemo = memo.trim();
					onChange(day.id, {
						label: nextLabel,
						memo: nextMemo === "" ? null : nextMemo,
					});
					close();
				}}
			>
				<TextField value={label} onChange={setDraftLabel}>
					<Label>名前</Label>
					<TextFieldInput />
				</TextField>
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
						isDisabled={isSubmitDisabled}
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
