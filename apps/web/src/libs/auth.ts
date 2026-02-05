import { createAuth } from "@next-lift/authentication/create-auth";
import { createLazyProxy } from "@next-lift/utilities/create-lazy-proxy";

/**
 * Better Auth インスタンス
 */
export const auth = createLazyProxy(() => createAuth());
