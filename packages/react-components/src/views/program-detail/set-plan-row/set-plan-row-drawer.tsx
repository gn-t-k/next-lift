"use client";

import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC, FormEvent, PropsWithChildren } from "react";
import { Button } from "../../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../../primitives/drawer";

type Props = PropsWithChildren<{
	title: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCommit: () => void;
	isCommitDisabled: boolean;
}>;

export const SetPlanRowDrawer: FC<Props> = ({
	title,
	isOpen,
	onOpenChange,
	onCommit,
	isCommitDisabled,
	children,
}) => {
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onCommit();
	};
	return (
		<Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button intent="plain" size="sq-xs" aria-label={`${title}を編集`}>
				<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
			</Button>
			<DrawerContent>
				<div className="flex flex-col gap-4 pt-2">
					<DrawerTitle>{title}</DrawerTitle>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
						aria-label={title}
					>
						<div className="flex flex-col gap-3">{children}</div>
						<div className="flex justify-end">
							<Button
								type="submit"
								intent="primary"
								size="sm"
								isDisabled={isCommitDisabled}
								className="[--btn-icon:var(--btn-fg)]"
							>
								<CheckIcon data-slot="icon" className="size-4" aria-hidden />
								確定
							</Button>
						</div>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	);
};
