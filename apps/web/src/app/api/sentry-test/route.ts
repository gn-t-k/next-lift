import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const GET = async () => {
	try {
		throw new Error("Sentryテスト: サーバー側エラー");
	} catch (error) {
		Sentry.captureException(error);
		return NextResponse.json(
			{ message: "サーバー側エラーをSentryに送信しました" },
			{ status: 500 },
		);
	}
};
