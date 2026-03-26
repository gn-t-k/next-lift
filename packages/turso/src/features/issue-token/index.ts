import type { R } from "@praha/byethrow";
import { withTursoFetch } from "../../helpers/fetch-context";
import {
	type IssueTokenError,
	issueToken as requestIssueToken,
} from "./issue-token";

export { IssueTokenError } from "./issue-token";

export function issueToken(params: {
	expiresInDays: null;
	databaseName: string;
}): R.ResultAsync<{ jwt: string; expiresAt: null }, IssueTokenError>;
export function issueToken(params: {
	expiresInDays: number;
	startingFrom: Date;
	databaseName: string;
}): R.ResultAsync<{ jwt: string; expiresAt: Date }, IssueTokenError>;
export function issueToken(
	params:
		| { expiresInDays: null; databaseName: string }
		| { expiresInDays: number; startingFrom: Date; databaseName: string },
) {
	return withTursoFetch(() => requestIssueToken(params));
}
