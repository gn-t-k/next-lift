"use client";

import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { useMediaQuery } from "../../../libs";
import { cn } from "../../../libs/utils";
import { Button } from "../../../primitives/button";
import { createAffordanceClass } from "../../../primitives/create-affordance";
import { SetPlanRowDrawer } from "./set-plan-row-drawer";
import { SetPlanRowPopover } from "./set-plan-row-popover";

const MD_BREAKPOINT = "(min-width: 768px)";

type Props = PropsWithChildren<{
	title: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCommit: () => void;
	isCommitDisabled: boolean;
	affordanceLabel?: string;
}>;

export const SetPlanRowEditTrigger: FC<Props> = ({
	title,
	isOpen,
	onOpenChange,
	onCommit,
	isCommitDisabled,
	affordanceLabel,
	children,
}) => {
	const isMdUp = useMediaQuery(MD_BREAKPOINT);
	const trigger = renderTrigger({ title, affordanceLabel });
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
			onOpenChange={onOpenChange}
			onCommit={onCommit}
			isCommitDisabled={isCommitDisabled}
		>
			{children}
		</Variant>
	);
};

const renderTrigger = ({
	title,
	affordanceLabel,
}: {
	title: string;
	affordanceLabel: string | undefined;
}): ReactNode => {
	if (affordanceLabel !== undefined) {
		return (
			<AriaButton
				className={cn(
					createAffordanceClass,
					"flex flex-1 items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left",
				)}
			>
				<span className="flex-1 truncate">{affordanceLabel}</span>
				<PlusIcon className="size-4 shrink-0 self-center" aria-hidden />
			</AriaButton>
		);
	}
	return (
		<Button intent="plain" size="sq-xs" aria-label={`${title}を編集`}>
			<PencilSquareIcon data-slot="icon" className="size-4" aria-hidden />
		</Button>
	);
};
