import { env } from "@next-lift/env/private";

type DatabaseConfig =
	| { type: "turso"; url: string; authToken: string }
	| { type: "local"; path: string };

/**
 * データベース接続設定を返す
 *
 * 環境による動作:
 * - production/preview (NODE_ENV=production):
 *   環境変数必須（envスキーマで強制）、Tursoに接続
 * - development:
 *   環境変数があればTurso、なければローカルファイル
 */
export const getDatabaseConfig = (): DatabaseConfig => {
	const url = env.TURSO_AUTH_DATABASE_URL;
	const authToken = env.TURSO_AUTH_DATABASE_AUTH_TOKEN;

	// 両方設定されている場合はTurso接続
	if (url && authToken) {
		return { type: "turso", url, authToken };
	}

	// 開発環境: ローカルファイル
	// production環境ではenvスキーマにより必ず上のifに入るため、ここには到達しない
	return { type: "local", path: "file:development-auth.db" };
};
