import type { FC, ReactNode } from "react";
import { Button } from "../../primitives/button";
import {
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "../../primitives/modal";

type Props = {
	name: string;
	trigger: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: () => void;
};

export const ProgramDeleteDialog: FC<Props> = ({
	name,
	trigger,
	isOpen,
	onOpenChange,
	onDelete,
}) => {
	const handleDelete = () => {
		onDelete();
		onOpenChange(false);
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			{trigger}
			<ModalContent role="alertdialog" size="md">
				<ModalHeader>
					<ModalTitle>このプログラムを削除しますか？</ModalTitle>
					<ModalDescription>
						{name} と、その
						Day・種目計画・セット計画を削除します。この操作は取り消せません。
					</ModalDescription>
				</ModalHeader>
				<ModalFooter>
					<ModalClose>キャンセル</ModalClose>
					<Button intent="danger" onPress={handleDelete}>
						削除
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
