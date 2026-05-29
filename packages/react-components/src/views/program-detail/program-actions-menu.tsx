import {
	DocumentDuplicateIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import type { FC, ReactNode } from "react";
import {
	Menu,
	MenuItem,
	MenuSeparator,
	MenuTrigger,
} from "../../primitives/menu";

type Props = {
	trigger: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
};

export const ProgramActionsMenu: FC<Props> = ({
	trigger,
	isOpen,
	onOpenChange,
	onEdit,
	onDuplicate,
	onDelete,
}) => (
	<MenuTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
		{trigger}
		<Menu placement="bottom end">
			<MenuItem onAction={onEdit}>
				<PencilSquareIcon className="size-4" aria-hidden />
				情報を編集
			</MenuItem>
			<MenuItem onAction={onDuplicate}>
				<DocumentDuplicateIcon className="size-4" aria-hidden />
				コピーして新規作成
			</MenuItem>
			<MenuSeparator />
			<MenuItem intent="danger" onAction={onDelete}>
				<TrashIcon className="size-4" aria-hidden />
				削除
			</MenuItem>
		</Menu>
	</MenuTrigger>
);
