import { ErrorFactory } from "@praha/error-factory";

/**
 * OAuthプロバイダーから返されたエラー
 */
export class OAuthProviderError extends ErrorFactory({
	name: "OAuthProviderError",
	message: "OAuth provider returned an error",
	fields: ErrorFactory.fields<{
		provider: "google" | "apple";
		code?: string;
	}>(),
}) {}

/**
 * ユーザーがOAuth認証をキャンセルした
 */
export class OAuthCancelledError extends ErrorFactory({
	name: "OAuthCancelledError",
	message: "User cancelled OAuth authentication",
}) {}

/**
 * ネットワークエラー
 */
export class NetworkError extends ErrorFactory({
	name: "NetworkError",
	message: "Network request failed",
	fields: ErrorFactory.fields<{
		url?: string;
	}>(),
}) {}

/**
 * セッション作成に失敗
 */
export class SessionError extends ErrorFactory({
	name: "SessionError",
	message: "Session operation failed",
	fields: ErrorFactory.fields<{
		operation: "create" | "get" | "delete";
	}>(),
}) {}

/**
 * データベース操作に失敗
 */
export class DatabaseError extends ErrorFactory({
	name: "DatabaseError",
	message: "Database operation failed",
	fields: ErrorFactory.fields<{
		operation: string;
	}>(),
}) {}

/**
 * 設定エラー（環境変数未設定、不正な設定値など）
 */
export class InvalidConfigurationError extends ErrorFactory({
	name: "InvalidConfigurationError",
	message: "Invalid configuration",
	fields: ErrorFactory.fields<{
		detail: string;
	}>(),
}) {}

/**
 * 認証処理で発生しうるエラーのユニオン型
 */
export type AuthenticationError =
	| OAuthProviderError
	| OAuthCancelledError
	| NetworkError
	| SessionError
	| DatabaseError
	| InvalidConfigurationError;

/**
 * エラーカテゴリ: ユーザー操作系エラー（UIフィードバックが必要）
 */
export type UserOperationError = OAuthProviderError | OAuthCancelledError;

/**
 * エラーカテゴリ: サーバー・設定系エラー（ログ記録・Sentry送信が必要）
 */
export type ServerError =
	| NetworkError
	| SessionError
	| DatabaseError
	| InvalidConfigurationError;

/**
 * エラーがサーバー系エラーかどうかを判定
 */
export const isServerError = (
	error: AuthenticationError,
): error is ServerError => {
	return (
		error instanceof NetworkError ||
		error instanceof SessionError ||
		error instanceof DatabaseError ||
		error instanceof InvalidConfigurationError
	);
};
