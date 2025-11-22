import type { AuthenticationError } from "@next-lift/authentication/errors";

/**
 * 認証エラーをユーザー向けメッセージに変換
 */
export const formatAuthenticationError = (
	error: AuthenticationError,
): string => {
	switch (error.name) {
		case "OAuthProviderError":
			return `${error.provider}での認証に失敗しました。もう一度お試しください。`;
		case "OAuthCancelledError":
			return "認証がキャンセルされました。";
		case "NetworkError":
			return "ネットワークエラーが発生しました。接続を確認してください。";
		case "SessionError":
			return "セッションの処理に失敗しました。もう一度お試しください。";
		case "DatabaseError":
			return "サーバーエラーが発生しました。しばらくしてからお試しください。";
		case "InvalidConfigurationError":
			return "システム設定エラーが発生しました。管理者にお問い合わせください。";
	}
};
