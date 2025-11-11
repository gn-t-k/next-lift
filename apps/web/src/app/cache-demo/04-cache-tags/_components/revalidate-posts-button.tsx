"use client";

import { Button } from "@next-lift/react-components/ui";
import type { FC } from "react";
import { useActionState } from "react";
import { revalidatePostsTag } from "../_mutations/revalidate-posts-tag";

export const RevalidatePostsButton: FC = () => {
	const [, formAction, isPending] = useActionState(revalidatePostsTag, null);

	return (
		<form action={formAction} className="w-full">
			<Button
				type="submit"
				intent="primary"
				isPending={isPending}
				className="w-full"
			>
				{isPending ? "再検証中..." : '"posts"タグを再検証'}
			</Button>
		</form>
	);
};
