import { createAuthClient } from "@next-lift/authentication/better-auth-react";
import { publicEnv } from "@next-lift/env/public";

export const authClient = createAuthClient({
	baseURL: publicEnv.NEXT_PUBLIC_BETTER_AUTH_URL,
});
