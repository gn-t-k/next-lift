import { createAuthClient } from "@next-lift/authentication/better-auth-react";

export const authClient = createAuthClient({
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript strict mode requires bracket notation
	// biome-ignore lint/correctness/noProcessGlobal: ブラウザ環境では`node:process`のimportが不可のため、グローバルprocessの使用が唯一の選択肢
	baseURL: process.env["NEXT_PUBLIC_BETTER_AUTH_URL"] as string,
});
