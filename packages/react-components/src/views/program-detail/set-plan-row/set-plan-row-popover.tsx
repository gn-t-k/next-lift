"use client";

import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import type { FC, FormEvent, PropsWithChildren } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { cx } from "../../../libs/primitive";
import { Button } from "../../../primitives/button";

type Props = PropsWithChildren<{
	title: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCommit: () => void;
	isCommitDisabled: boolean;
}>;

export const SetPlanRowPopover: FC<Props> = ({
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
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<Button intent="plain" size="sq-xs" aria-label={`${title}を編集`}>
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
				<Dialog className="w-72 p-3 outline-hidden" aria-label={title}>
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
								size="sq-sm"
								isDisabled={isCommitDisabled}
								aria-label={`${title}の編集を確定`}
							>
								<CheckIcon data-slot="icon" className="size-4" aria-hidden />
							</Button>
						</div>
					</form>
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
};
