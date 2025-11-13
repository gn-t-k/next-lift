"use client";

import { authClient } from "../../../lib/auth-client";

const LoginPage = () => {
	const handleGoogleSignIn = async () => {
		await authClient.signIn.social({
			provider: "google",
		});
	};

	return (
		<div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
			<h1 style={{ marginBottom: "2rem" }}>ログイン</h1>
			<button
				type="button"
				onClick={handleGoogleSignIn}
				style={{
					padding: "1rem 2rem",
					backgroundColor: "#4285f4",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
					fontSize: "1rem",
					width: "100%",
				}}
			>
				Googleでログイン
			</button>
		</div>
	);
};

export default LoginPage;
