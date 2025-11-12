"use client";

import { Button } from "@next-lift/react-components/ui";
import type { FC } from "react";
import { useActionState } from "react";
import { revalidateAllTags } from "../_mutations/revalidate-all-tags";

export const RevalidateAllButton: FC = () => {
	const [, formAction, isPending] = useActionState(revalidateAllTags, null);

	return (
		<form action={formAction} className="w-full">
			<Button
				type="submit"
				intent="primary"
				isPending={isPending}
				className="w-full"
			>
				{isPending ? "再検証中..." : "すべてのタグを再検証"}
			</Button>
		</form>
	);
};
