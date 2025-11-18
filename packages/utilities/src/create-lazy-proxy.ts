/**
 * 初回アクセス時に初期化関数を実行し、結果をキャッシュする遅延初期化Proxy
 *
 * @template T - 初期化されるオブジェクトの型
 * @param initializer - 初期化関数
 * @returns 遅延初期化されたProxyオブジェクト
 *
 * @example
 * // 環境変数の遅延初期化
 * const env = createLazyProxy(() => createEnvObject());
 * env.API_KEY; // 初回アクセス時に初期化
 *
 * @example
 * // 重い初期化処理の遅延
 * const auth = createLazyProxy(() => betterAuth({ ... }));
 * auth.api; // 初回アクセス時に初期化
 */
export const createLazyProxy = <T extends object>(initializer: () => T): T => {
	let instance: T | null = null;

	const getInstance = () => {
		if (instance !== null) {
			return instance;
		}
		instance = initializer();
		return instance;
	};

	return new Proxy({} as T, {
		get(_target, prop) {
			const inst = getInstance();
			return inst[prop as keyof T];
		},
	});
};
