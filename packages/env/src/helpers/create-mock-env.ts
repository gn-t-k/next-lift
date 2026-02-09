export const createMockEnv = <TKey extends string>(
	overrides: Partial<Record<TKey, string>>,
): Record<TKey, string> => {
	return new Proxy({} as Record<TKey, string>, {
		get(_, prop: string) {
			if (prop in overrides) {
				return overrides[prop as TKey];
			}
			throw new Error(`環境変数 ${prop} がモックされていません`);
		},
	});
};
