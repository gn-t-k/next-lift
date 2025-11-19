import type { AuthenticationError } from "@next-lift/authentication/errors";
import { isServerError } from "@next-lift/authentication/errors";
import * as Sentry from "@sentry/nextjs";

/**
 * 認証エラーをSentryに報告する
 * サーバー系エラーのみ報告し、ユーザー操作系エラーは報告しない
 */
export const reportAuthenticationError = (error: AuthenticationError): void => {
	if (!isServerError(error)) {
		// ユーザー操作系エラー（OAuthProviderError, OAuthCancelledError）は報告しない
		return;
	}

	// サーバー系エラーをSentryに報告
	Sentry.captureException(error, {
		tags: {
			error_type: "authentication",
			error_name: error.name,
		},
		contexts: {
			authentication_error: {
				name: error.name,
				message: error.message,
				cause: error.cause ? String(error.cause) : undefined,
			},
		},
	});
};
