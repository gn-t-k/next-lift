"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren, ReactNode, SubmitEvent } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { cn } from "../../../../libs/utils";
import { Button } from "../../../../primitives/button";

type Props = PropsWithChildren<{
	title: string;
	trigger: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCommit: () => void;
	isCommitDisabled: boolean;
}>;

export const SetPlanFormDialogPopover: FC<Props> = ({
	title,
	trigger,
	isOpen,
	onOpenChange,
	onCommit,
	isCommitDisabled,
	children,
}) => {
	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		onCommit();
	};
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			{trigger}
			<Popover
				placement="bottom end"
				className={cn(
					"max-w-[min(22rem,calc(100vw-2rem))]",
					"rounded-lg border border-border bg-overlay text-overlay-fg shadow-lg outline-hidden",
					"entering:fade-in entering:animate-in entering:duration-150",
					"exiting:fade-out exiting:animate-out exiting:duration-100",
				)}
			>
				<Dialog className="w-88 p-3 outline-hidden" aria-label={title}>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-3"
						aria-label={title}
					>
						{children}
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
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
};
