"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Button } from "../../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../../primitives/drawer";
import { SetPlanEditForm } from "./set-plan-edit-form";
import { type SetPlanPattern, useSetPlanEditing } from "./use-set-plan-editing";

type Props = {
	pattern: SetPlanPattern | null;
	weightUnit: "kg" | "lbs";
	weightStep: number;
	title: string;
	onChange: (pattern: SetPlanPattern) => void;
};

export const SetPlanRowDrawer: FC<Props> = ({
	pattern,
	weightUnit,
	weightStep,
	title,
	onChange,
}) => {
	const editing = useSetPlanEditing(pattern, onChange);
	return (
		<Drawer isOpen={editing.isOpen} onOpenChange={editing.handleOpenChange}>
			<Button
				intent="plain"
				size="sq-xs"
				onPress={editing.start}
				aria-label={`${title}を編集`}
			>
				<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
			<DrawerContent>
				{editing.draft !== null && (
					<div className="flex flex-col gap-4 pt-2">
						<DrawerTitle>{title}</DrawerTitle>
						<SetPlanEditForm
							draft={editing.draft}
							weightUnit={weightUnit}
							weightStep={weightStep}
							onUpdate={editing.setDraft}
							onSubmit={editing.submit}
						/>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
};
