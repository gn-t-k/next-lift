import { toNextJsHandler } from "@next-lift/authentication/better-auth-nextjs";
import { auth } from "@next-lift/authentication/instance";

export const { GET, POST } = toNextJsHandler(auth.handler);
