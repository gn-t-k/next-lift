"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
	const handleClientError = () => {
		try {
			// biome-ignore lint/security/noSecrets: テスト用のエラーメッセージ
			throw new Error("Sentryテスト: クライアント側エラー");
		} catch (error) {
			Sentry.captureException(error);
			// biome-ignore lint/security/noSecrets: テスト用のメッセージ
			alert("クライアント側エラーをSentryに送信しました");
		}
	};

	const handleServerError = async () => {
		try {
			const response = await fetch("/api/sentry-test");
			const data = await response.json();
			alert(data.message);
		} catch (_error) {
			// biome-ignore lint/security/noSecrets: テスト用のメッセージ
			alert("サーバー側エラーを送信しました");
		}
	};

	return (
		<div style={{ padding: "2rem" }}>
			<h1>Sentryエラー送信テスト</h1>
			<div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
				<button
					type="button"
					onClick={handleClientError}
					style={{
						padding: "0.5rem 1rem",
						backgroundColor: "#dc2626",
						color: "white",
						border: "none",
						borderRadius: "0.25rem",
						cursor: "pointer",
					}}
				>
					クライアント側エラーをテスト
				</button>
				<button
					type="button"
					onClick={handleServerError}
					style={{
						padding: "0.5rem 1rem",
						backgroundColor: "#dc2626",
						color: "white",
						border: "none",
						borderRadius: "0.25rem",
						cursor: "pointer",
					}}
				>
					サーバー側エラーをテスト
				</button>
			</div>
		</div>
	);
}
