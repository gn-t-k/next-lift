/**
 * Next Lift標準タグセット
 * アプリケーション全体で使用するSentryタグキーの定義
 *
 * @see ADR-018
 */
export const StandardTags = {
	// WHAT（何を）
	ERROR_TYPE: "error_type",
	ERROR_NAME: "error_name",
	COMPONENT: "component",
	OPERATION: "operation",

	// WHO（誰が）- 将来追加予定
	USER_ROLE: "user_role",
	ACCOUNT_TIER: "account_tier",
} as const;
