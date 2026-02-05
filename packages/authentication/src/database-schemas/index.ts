import { account } from "./account";
import { perUserDatabase } from "./per-user-database";
import { session } from "./session";
import { user } from "./user";
import { verification } from "./verification";

export { account } from "./account";
export { perUserDatabase } from "./per-user-database";
export { session } from "./session";
export { user } from "./user";
export { verification } from "./verification";

export const schema = {
	user,
	session,
	account,
	perUserDatabase,
	verification,
} as const;
