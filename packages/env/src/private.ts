import { createLazyProxy } from "./libs/create-lazy-proxy";
import {
	type PrivateBuildEnv,
	type PrivateRuntimeEnv,
	privateBuildEnvSchema,
	privateRuntimeEnvSchema,
} from "./schemas";

type PrivateEnv = PrivateBuildEnv & PrivateRuntimeEnv;

const runtimeCache: Partial<PrivateRuntimeEnv> = {};
const runtimeInitialized: Partial<Record<keyof PrivateRuntimeEnv, boolean>> =
	{};

const runtimeShape = privateRuntimeEnvSchema.shape;

const createEnvObject = () => {
	// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可のため、グローバルprocessを使用する
	const processEnv = process.env;

	// 初回プロパティアクセス時にビルド時環境変数を検証
	const buildEnv = privateBuildEnvSchema.parse(processEnv);
	const base = { ...buildEnv };

	Object.keys(runtimeShape).forEach((key_) => {
		Object.defineProperty(base, key_, {
			enumerable: true,
			configurable: false,
			get: () => {
				const key = key_ as keyof PrivateRuntimeEnv;
				if (runtimeInitialized[key] === true) {
					return runtimeCache[key];
				}

				const raw = processEnv[key];
				const schema = runtimeShape[key];
				const parsed = schema.parse(raw);

				runtimeCache[key] = parsed;
				runtimeInitialized[key] = true;
				return parsed;
			},
		});
	});

	return base as PrivateEnv;
};

export const env = createLazyProxy(() => createEnvObject());
