import type { FC, ReactNode } from "react";
import { Dialog } from "react-aria-components";
import type { useMediaQuery } from "../../libs";
import { Button } from "../../primitives/button";
import { Drawer, DrawerContent, DrawerTitle } from "../../primitives/drawer";
import { Popover, PopoverContent } from "../../primitives/popover";

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

	switch (desktopViewport) {
		case "pending":
			return trigger;
		case "matched":
			return (
				<Popover isOpen={isOpen} onOpenChange={onOpenChange}>
					{trigger}
					<PopoverContent
						placement="bottom end"
						offset={4}
						className="w-80 p-3"
					>
						<Dialog
							role="alertdialog"
							aria-label={title}
							className="outline-hidden"
						>
							<ProgramDeleteDialogContent
								title={title}
								name={name}
								onCancel={handleCancel}
								onDelete={handleDelete}
							/>
						</Dialog>
					</PopoverContent>
				</Popover>
			);
		case "unmatched":
			return (
				<Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
					{trigger}
					<DrawerContent role="alertdialog">
						<div className="flex flex-col gap-4 pt-2">
							<DrawerTitle>{title}</DrawerTitle>
							<ProgramDeleteDialogBody name={name} />
							<ProgramDeleteDialogActions
								onCancel={handleCancel}
								onDelete={handleDelete}
							/>
						</div>
					</DrawerContent>
				</Drawer>
			);
	}
};

type ContentProps = {
	title: string;
	name: string;
	onCancel: () => void;
	onDelete: () => void;
};

const ProgramDeleteDialogContent: FC<ContentProps> = ({
	title,
	name,
	onCancel,
	onDelete,
}) => (
	<div className="flex flex-col gap-3">
		<div className="flex flex-col gap-1">
			<h2 className="text-balance font-semibold text-base/6 text-fg">
				{title}
			</h2>
			<ProgramDeleteDialogBody name={name} />
		</div>
		<ProgramDeleteDialogActions onCancel={onCancel} onDelete={onDelete} />
	</div>
);

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
