import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		// biome-ignore lint/security/noSecrets: テスト用のエラーメッセージ
		throw new Error("Sentryテスト: サーバー側エラー");
	} catch (error) {
		Sentry.captureException(error);
		return NextResponse.json(
			// biome-ignore lint/security/noSecrets: テスト用のメッセージ
			{ message: "サーバー側エラーをSentryに送信しました" },
			{ status: 500 },
		);
	}
}
