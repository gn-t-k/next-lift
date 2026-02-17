import { vi } from "vitest";

export const mockCrypto = {
	getRandomValues: vi.fn(),
	digestStringAsync: vi.fn(),
	CryptoDigestAlgorithm: { SHA256: "SHA-256" } as const,
};

export const mockCryptoOk = (
	randomBytes = new Uint8Array(32).fill(0xab),
	hashResult = "hashed-nonce",
) => {
	mockCrypto.getRandomValues.mockReturnValue(randomBytes);
	mockCrypto.digestStringAsync.mockResolvedValue(hashResult);
};
