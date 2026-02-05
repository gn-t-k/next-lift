import { createAuthClient } from "@next-lift/authentication/integrations/better-auth-react";

// baseURLを省略することで、同じオリジンへのリクエストになる
// これにより、プレビュー環境でも動的なURLに対応できる
export const authClient = createAuthClient({});
