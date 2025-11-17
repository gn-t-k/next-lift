/** biome-ignore-all lint/complexity/useLiteralKeys: TypeScript strict modeの要件でブラケット記法が必須のため、ドット記法は使用できない */
import { type PublicRuntimeEnv, publicRuntimeEnvSchema } from "./schemas";

let cachedPublicEnv: PublicRuntimeEnv | null = null;

export const publicEnv = () => {
	if (cachedPublicEnv !== null) {
		return cachedPublicEnv;
	}

	// biome-ignore lint/correctness/noProcessGlobal: ブラウザ環境では`node:process`のimportが不可のため、グローバルprocessを使用する
	const processEnv = process.env;

	type MaybeUndefined<T> = Record<keyof T, T[keyof T] | undefined>;

	const raw: MaybeUndefined<PublicRuntimeEnv> = {
		NEXT_PUBLIC_SENTRY_DSN: processEnv["NEXT_PUBLIC_SENTRY_DSN"],
		NEXT_PUBLIC_BETTER_AUTH_URL: processEnv["NEXT_PUBLIC_BETTER_AUTH_URL"],
	};

	cachedPublicEnv = publicRuntimeEnvSchema.parse(raw);
	return cachedPublicEnv;
};
