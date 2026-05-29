"use client";

import {
	Button,
	Drawer,
	DrawerContent,
	DrawerTitle,
	ErrorAlert,
	Popover,
	PopoverContent,
} from "@next-lift/react-components";
import { R } from "@praha/byethrow";
import { type FC, useActionState, useState, useSyncExternalStore } from "react";
import { deleteAccount } from "../_mutations/delete-account";

type MediaQueryState = "pending" | "matched" | "unmatched";

const useMediaQuery = (query: string): MediaQueryState =>
	useSyncExternalStore(
		(callback) => {
			const mql = window.matchMedia(query);
			mql.addEventListener("change", callback);
			return () => mql.removeEventListener("change", callback);
		},
		() => (window.matchMedia(query).matches ? "matched" : "unmatched"),
		() => "pending",
	);

export const DeleteAccountButton: FC = () => {
	const [state, formAction, isPending] = useActionState(
		deleteAccount,
		undefined,
	);
	const [isOpen, setIsOpen] = useState(false);
	const desktopViewport = useMediaQuery("(min-width: 768px)");
	const title = "アカウントを削除しますか？";
	const trigger = <Button intent="danger">アカウントを削除</Button>;
	const content = (
		<DeleteAccountDialogContent
			formAction={formAction}
			isPending={isPending}
			hasError={state !== undefined && R.isFailure(state)}
			onCancel={() => setIsOpen(false)}
		/>
	);

	switch (desktopViewport) {
		case "pending":
			return trigger;
		case "matched":
			return (
				<Popover isOpen={isOpen} onOpenChange={setIsOpen}>
					{trigger}
					<PopoverContent placement="bottom end" className="w-96 p-4">
						<div
							role="alertdialog"
							aria-label={title}
							className="flex flex-col gap-4 outline-hidden"
						>
							<div className="flex flex-col gap-1">
								<h2 className="text-balance font-semibold text-base/6 text-fg">
									{title}
								</h2>
								<DeleteAccountDialogDescription />
							</div>
							{content}
						</div>
					</PopoverContent>
				</Popover>
			);
		case "unmatched":
			return (
				<Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
					{trigger}
					<DrawerContent role="alertdialog">
						<div className="flex flex-col gap-4 pt-2">
							<DrawerTitle>{title}</DrawerTitle>
							<DeleteAccountDialogDescription />
							{content}
						</div>
					</DrawerContent>
				</Drawer>
			);
	}
};

const DeleteAccountDialogDescription: FC = () => (
	<p className="text-pretty text-muted-fg text-sm/6">
		この操作は取り消せません。アカウントとすべてのトレーニングデータへのアクセスが失われます。同じアカウントで再登録しても、データは復元されません。
	</p>
);

type ContentProps = {
	formAction: (payload: FormData) => void;
	isPending: boolean;
	hasError: boolean;
	onCancel: () => void;
};

const DeleteAccountDialogContent: FC<ContentProps> = ({
	formAction,
	isPending,
	hasError,
	onCancel,
}) => (
	<div className="flex flex-col gap-3">
		{hasError && <ErrorAlert>アカウントの削除に失敗しました</ErrorAlert>}
		<div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
			<Button intent="outline" size="sm" onPress={onCancel}>
				キャンセル
			</Button>
			<form action={formAction}>
				<Button type="submit" intent="danger" size="sm" isDisabled={isPending}>
					{isPending ? "削除中..." : "削除する"}
				</Button>
			</form>
		</div>
	</div>
);
