"use client";

import { Button } from "@next-lift/react-components/ui";
import type { FC } from "react";
import { useActionState } from "react";
import { revalidateCachedData } from "../_mutations/revalidate-cached-data";

export const RefreshButton: FC = () => {
	const [, formAction, isPending] = useActionState(revalidateCachedData, null);

	return (
		<form action={formAction}>
			<Button type="submit" intent="primary" isPending={isPending}>
				{isPending ? "再検証中..." : "キャッシュを再検証"}
			</Button>
		</form>
	);
};
