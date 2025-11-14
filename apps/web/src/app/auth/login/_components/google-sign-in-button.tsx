"use client";

import { Button } from "@next-lift/react-components/ui";
import { useState } from "react";
import { authClient } from "../../../../lib/auth-client";

export const GoogleSignInButton = () => {
	const [isPending, setIsPending] = useState(false);

	const handleGoogleSignIn = async () => {
		setIsPending(true);
		// リダイレクトされるまでpending状態を維持
		// ページ遷移後はこのコンポーネントごと消えるので、setIsPending(false)は不要
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		} catch (error) {
			console.error("Google sign in failed:", error);
			setIsPending(false); // エラー時のみpending状態を解除
		}
	};

	return (
		<Button onClick={handleGoogleSignIn} isDisabled={isPending}>
			{isPending ? "ログイン中..." : "Googleでログイン"}
		</Button>
	);
};
