"use client";

import {
	Button,
	ErrorAlert,
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@next-lift/react-components/ui";
import { R } from "@praha/byethrow";
import { type FC, useActionState } from "react";
import { deleteAccount } from "../_mutations/delete-account";

export const DeleteAccountButton: FC = () => {
	const [state, formAction, isPending] = useActionState(
		deleteAccount,
		undefined,
	);

	return (
		<Modal>
			<ModalTrigger intent="danger">アカウントを削除</ModalTrigger>
			<ModalContent role="alertdialog" size="md">
				<ModalHeader>
					<ModalTitle>アカウントを削除しますか？</ModalTitle>
					<ModalDescription>
						この操作は取り消せません。アカウントに関連するすべての認証情報が削除されます。
					</ModalDescription>
				</ModalHeader>
				<ModalFooter>
					{state && R.isFailure(state) && (
						<ErrorAlert className="w-full">
							アカウントの削除に失敗しました
						</ErrorAlert>
					)}
					<ModalClose>キャンセル</ModalClose>
					<form action={formAction}>
						<Button type="submit" intent="danger" isDisabled={isPending}>
							{isPending ? "削除中..." : "削除する"}
						</Button>
					</form>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
