"use client";

import { useSyncExternalStore } from "react";

// hydration 完了前は null を返し、SSR/CSR で必ず一致させる。
// caller は null の間は viewport 依存の分岐を確定させない。
export const useMediaQuery = (query: string): boolean | null =>
	useSyncExternalStore(
		(callback) => {
			const mql = window.matchMedia(query);
			mql.addEventListener("change", callback);
			return () => mql.removeEventListener("change", callback);
		},
		() => window.matchMedia(query).matches,
		() => null,
	);
