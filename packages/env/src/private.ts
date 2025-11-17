import {
	type PrivateBuildEnv,
	type PrivateRuntimeEnv,
	privateBuildEnvSchema,
	privateRuntimeEnvSchema,
} from "./schemas";

type PrivateEnv = PrivateBuildEnv & PrivateRuntimeEnv;

let cachedEnvObject: PrivateEnv | null = null;
const runtimeCache: Partial<PrivateRuntimeEnv> = {};
const runtimeInitialized: Partial<Record<keyof PrivateRuntimeEnv, boolean>> =
	{};

const runtimeShape = privateRuntimeEnvSchema.shape;

// biome-ignore lint/correctness/noProcessGlobal: Edge Runtimeでは`node:process`のimportが不可のため、グローバルprocessを使用する
const processEnv = process.env;

// モジュールロード時にビルド時に取得可能な環境変数だけ検証
const buildEnv = privateBuildEnvSchema.parse(processEnv);

const createEnvObject = () => {
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

export const env = () => {
	if (cachedEnvObject !== null) {
		return cachedEnvObject;
	}
	cachedEnvObject = createEnvObject();
	return cachedEnvObject;
};
