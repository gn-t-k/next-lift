import { account } from "./account/account";
import { perUserDatabase } from "./per-user-database/per-user-database";
import { session } from "./session/session";
import { user } from "./user/user";
import { verification } from "./verification/verification";

export { account } from "./account/account";
export { perUserDatabase } from "./per-user-database/per-user-database";
export { session } from "./session/session";
export { user } from "./user/user";
export { verification } from "./verification/verification";

export const schema = {
	user,
	session,
	account,
	perUserDatabase,
	verification,
} as const;
