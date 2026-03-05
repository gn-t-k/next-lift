import type { KeyObject } from "node:crypto";
import { sign } from "node:crypto";

type SignJwtInput = {
	header: { alg: "ES256"; kid: string };
	payload: Record<string, unknown>;
	privateKey: KeyObject;
};

const base64url = (buf: Buffer): string => buf.toString("base64url");

export const signJwt = (input: SignJwtInput): string => {
	const header = base64url(Buffer.from(JSON.stringify(input.header)));
	const payload = base64url(Buffer.from(JSON.stringify(input.payload)));

	const signingInput = `${header}.${payload}`;
	const signature = sign("sha256", Buffer.from(signingInput), {
		key: input.privateKey,
		dsaEncoding: "ieee-p1363",
	});

	return `${signingInput}.${base64url(signature)}`;
};
