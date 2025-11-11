"use client";

import {
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
} from "@next-lift/react-components/demo";
import { Button } from "@next-lift/react-components/ui";
import type { FC } from "react";
import { useActionState } from "react";
import { clearUsername } from "../_mutations/clear-username";
import { setUsername } from "../_mutations/set-username";

export const UsernameForm: FC = () => {
	const [, formAction, isPending] = useActionState(
		async (_prevState: null, formData: FormData) => {
			const action = formData.get("action");

			if (action === "set") {
				const username = formData.get("username") as string;
				if (username) {
					await setUsername(username);
				}
			} else if (action === "clear") {
				await clearUsername();
			}

			return null;
		},
		null,
	);

	return (
		<DemoCard>
			<DemoCardHeader priority="B">
				<DemoCardTitle>ユーザー名設定</DemoCardTitle>
				<DemoCardDescription>
					cookieに値を設定してキャッシュの動作を確認
				</DemoCardDescription>
			</DemoCardHeader>
			<DemoCardContent>
				<div className="space-y-3">
					<form action={formAction} className="space-y-3">
						<label className="block">
							<span className="font-medium text-fg text-sm">ユーザー名</span>
							<input
								type="text"
								name="username"
								disabled={isPending}
								className="mt-1 block w-full rounded-md border border-border bg-bg px-3 py-2 text-fg disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="名前を入力"
							/>
						</label>
						<div className="flex gap-2">
							<Button
								type="submit"
								name="action"
								value="set"
								intent="primary"
								isPending={isPending}
							>
								設定
							</Button>
							<Button
								type="submit"
								name="action"
								value="clear"
								intent="outline"
								isPending={isPending}
							>
								クリア
							</Button>
						</div>
					</form>
				</div>
			</DemoCardContent>
		</DemoCard>
	);
};
