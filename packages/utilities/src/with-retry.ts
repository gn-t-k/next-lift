type WithRetryOptions = {
	maxRetries?: number;
	backoff: (attempt: number) => number;
};

export const withRetry = async <T>(
	fn: () => Promise<T>,
	options: WithRetryOptions,
): Promise<T> => {
	const { maxRetries = 3, backoff } = options;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (e) {
			if (attempt >= maxRetries) {
				throw e;
			}
			await new Promise((resolve) => setTimeout(resolve, backoff(attempt)));
		}
	}

	throw new Error("Unreachable");
};

export const exponentialBackoff =
	(initialDelayMs: number) => (attempt: number) =>
		initialDelayMs * 2 ** attempt;
