import type { FC, ReactNode } from "react";
import type { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { ResponsiveDialog } from "../../primitives/responsive-dialog";

type Props = {
	name: string;
	trigger: ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: () => void;
	desktopViewport: ReturnType<typeof useMediaQuery>;
};

export const ProgramDeleteDialog: FC<Props> = ({
	name,
	trigger,
	isOpen,
	onOpenChange,
	onDelete,
	desktopViewport,
}) => {
	const title = "このプログラムを削除しますか？";
	const handleCancel = () => {
		onOpenChange(false);
	};
	const handleDelete = () => {
		onDelete();
		onOpenChange(false);
	};

	return (
		<ResponsiveDialog
			title={title}
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			desktopViewport={desktopViewport}
			popoverWidth="default"
			role="alertdialog"
		>
			<div className="flex flex-col gap-3">
				<ProgramDeleteDialogBody name={name} />
				<ProgramDeleteDialogActions
					onCancel={handleCancel}
					onDelete={handleDelete}
				/>
			</div>
		</ResponsiveDialog>
	);
};

const ProgramDeleteDialogBody: FC<{ name: string }> = ({ name }) => (
	<p className="text-pretty text-muted-fg text-sm/6">
		{name} と、その
		Day・種目計画・セット計画を削除します。この操作は取り消せません。
	</p>
);

type ActionsProps = {
	onCancel: () => void;
	onDelete: () => void;
};

const ProgramDeleteDialogActions: FC<ActionsProps> = ({
	onCancel,
	onDelete,
}) => (
	<div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
		<Button intent="outline" size="sm" onPress={onCancel}>
			キャンセル
		</Button>
		<Button intent="danger" size="sm" onPress={onDelete}>
			削除
		</Button>
	</div>
);
