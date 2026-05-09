"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { cx } from "../../../libs/primitive";
import { Button } from "../../../primitives/button";
import { SetPlanEditForm } from "./set-plan-edit-form";
import { type SetPlanPattern, useSetPlanEditing } from "./use-set-plan-editing";

type Props = {
	pattern: SetPlanPattern | null;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	title: string;
	onChange: (pattern: SetPlanPattern) => void;
};

export const SetPlanRowPopover: FC<Props> = ({
	pattern,
	weightUnit,
	weightStep,
	title,
	onChange,
}) => {
	const editing = useSetPlanEditing(pattern, onChange);
	return (
		<DialogTrigger
			isOpen={editing.isOpen}
			onOpenChange={editing.handleOpenChange}
		>
			<Button
				intent="plain"
				size="sq-xs"
				onPress={editing.start}
				aria-label={`${title}を編集`}
			>
				<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
			<Popover
				placement="bottom end"
				className={cx(
					"max-w-[min(20rem,calc(100vw-2rem))]",
					"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
					"entering:fade-in entering:animate-in entering:duration-150",
					"exiting:fade-out exiting:animate-out exiting:duration-100",
				)}
			>
				<Dialog className="outline-hidden" aria-label={title}>
					{editing.draft !== null && (
						<SetPlanEditForm
							draft={editing.draft}
							weightUnit={weightUnit}
							weightStep={weightStep}
							onUpdate={editing.setDraft}
							onSubmit={editing.submit}
							className="w-72 p-3"
						/>
					)}
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
};
