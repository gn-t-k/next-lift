import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@next-lift/env/private";
import { ErrorFactory } from "@praha/error-factory";

/**
 * AES-256-GCM暗号化/復号ユーティリティ
 *
 * Node.js組み込みのcryptoモジュールを使用。
 * NPMパッケージ（aes-256-gcm等）は7年以上更新されておらず、結局cryptoモジュールをラップしているだけなので直接使用する。
 *
 * IV長(12バイト)はNIST SP 800-38Dの推奨値。
 * @see https://gist.github.com/rjz/15baffeab434b8125ca4d783f4116d81
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export class EncryptTokenError extends ErrorFactory({
	name: "EncryptTokenError",
	message: "トークンの暗号化中にエラーが発生しました。",
}) {}

export class DecryptTokenError extends ErrorFactory({
	name: "DecryptTokenError",
	message: "トークンの復号化中にエラーが発生しました。",
}) {}

export const getEncryptionKey = (): Buffer =>
	Buffer.from(env.TURSO_TOKEN_ENCRYPTION_KEY, "hex");

export const encrypt = (plaintext: string, key: Buffer): string => {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();

	// iv(12) + tag(16) + encrypted を結合してBase64エンコード
	return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decrypt = (ciphertext: string, key: Buffer): string => {
	const data = Buffer.from(ciphertext, "base64");
	const iv = data.subarray(0, IV_LENGTH);
	const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
	const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);

	return decipher.update(encrypted) + decipher.final("utf8");
};
