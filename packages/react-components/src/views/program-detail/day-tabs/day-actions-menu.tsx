import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import {
	Menu,
	MenuItem,
	MenuSeparator,
	MenuTrigger,
} from "../../../primitives/menu";

type Props = {
	label: string;
	trigger: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onRename: () => void;
	onDelete: () => void;
};

export const DayActionsMenu: FC<Props> = ({
	label,
	trigger,
	isOpen,
	onOpenChange,
	onRename,
	onDelete,
}) => (
	<MenuTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
		{trigger}
		<Menu placement="bottom end">
			<MenuItem onAction={onRename}>
				<PencilSquareIcon className="size-4" aria-hidden />
				名前を変更
			</MenuItem>
			<MenuSeparator />
			<MenuItem
				intent="danger"
				onAction={onDelete}
				aria-label={`${label}を削除`}
				textValue={`${label}を削除`}
			>
				<TrashIcon className="size-4" aria-hidden />
				削除
			</MenuItem>
		</Menu>
	</MenuTrigger>
);
