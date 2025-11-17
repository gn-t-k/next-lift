/**
 * 初回アクセス時に初期化関数を実行し、結果をキャッシュする遅延初期化Proxy
 *
 * @example
 * const auth = createLazyProxy(() => betterAuth({ ... }));
 * auth.api.getSession({ ... }); // 初回アクセス時に初期化
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
