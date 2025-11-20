import type { AuthenticationError } from "@next-lift/authentication/errors";
import { isServerError } from "@next-lift/authentication/errors";
import * as Sentry from "@sentry/nextjs";
import { StandardTags } from "./sentry/standard-tags";

/**
 * 認証エラーをSentryに報告する
 * サーバー系エラーのみ報告し、ユーザー操作系エラーは報告しない
 */
export const reportAuthenticationError = (error: AuthenticationError): void => {
	if (!isServerError(error)) {
		return;
	}

	Sentry.captureException(error, {
		tags: {
			[StandardTags.ERROR_TYPE]: "authentication",
			[StandardTags.COMPONENT]: "authentication",
			[StandardTags.ERROR_NAME]: error.name,
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
