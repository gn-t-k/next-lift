"use client";

import { Button } from "@next-lift/react-components/ui";
import type { FC } from "react";
import { useActionState } from "react";
import { revalidateUserTag } from "../_mutations/revalidate-user-tag";

export const RevalidateUserButton: FC = () => {
	const [, formAction, isPending] = useActionState(revalidateUserTag, null);

	return (
		<form action={formAction} className="w-full">
			<Button
				type="submit"
				intent="primary"
				isPending={isPending}
				className="w-full"
			>
				{isPending ? "再検証中..." : '"user"タグを再検証'}
			</Button>
		</form>
	);
};
