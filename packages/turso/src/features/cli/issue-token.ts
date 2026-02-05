// biome-ignore-all lint/complexity/useLiteralKeys: インデックスシグネチャの型ではドット記法が許可されていないため
import process from "node:process";
import { parseArgs } from "node:util";
import { R } from "@praha/byethrow";
import { issueToken } from "../issue-token/issue-token";

const { values } = parseArgs({
	options: {
		name: {
			type: "string",
			short: "n",
		},
		"expires-in-days": {
			type: "string",
			short: "e",
		},
	},
});

if (!values.name) {
	console.error("Error: --name フラグは必須です");
	console.error(
		"Usage: pnpm db:issue-token --name=<database-name> [--expires-in-days=<days>]",
	);
	process.exit(1);
}

const expiresInDays = values["expires-in-days"]
	? Number.parseInt(values["expires-in-days"], 10)
	: null;

if (expiresInDays !== null && Number.isNaN(expiresInDays)) {
	console.error("Error: --expires-in-days は数値である必要があります");
	process.exit(1);
}

const credentials = {
	apiToken: process.env["TURSO_PLATFORM_API_TOKEN"] ?? "",
	organization: process.env["TURSO_ORGANIZATION"] ?? "",
};

const result =
	expiresInDays === null
		? await issueToken(
				{ databaseName: values.name, expiresInDays: null },
				credentials,
			)
		: await issueToken(
				{
					databaseName: values.name,
					expiresInDays,
					startingFrom: new Date(),
				},
				credentials,
			);

if (R.isFailure(result)) {
	console.error("トークンの発行に失敗しました:", result.error.message);
	if (result.error.cause) {
		console.error("Cause:", result.error.cause);
	}
	process.exit(1);
}

const token = result.value;
console.log("トークンを発行しました:");
console.log(`  JWT: ${token.jwt}`);
if (token.expiresAt) {
	console.log(`  Expires At: ${token.expiresAt.toISOString()}`);
} else {
	console.log("  Expires At: never");
}
