"use client";

import { Button } from "@next-lift/react-components/ui";
import { useTransition } from "react";
import { authClient } from "../../../../lib/auth-client";

export const GoogleSignInButton = () => {
	const [isPending, startTransition] = useTransition();

	const handleGoogleSignIn = () => {
		startTransition(async () => {
			try {
				await authClient.signIn.social({
					provider: "google",
				});
			} catch (error) {
				console.error("Google sign in failed:", error);
			}
		});
	};

	return (
		<Button onClick={handleGoogleSignIn} isDisabled={isPending}>
			{isPending ? "ログイン中..." : "Googleでログイン"}
		</Button>
	);
};
