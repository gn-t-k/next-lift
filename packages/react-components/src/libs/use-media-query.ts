"use client";

import { useSyncExternalStore } from "react";

type MediaQueryState = "pending" | "matched" | "unmatched";

export const useMediaQuery = (query: string): MediaQueryState =>
	useSyncExternalStore(
		(callback) => {
			const mql = window.matchMedia(query);
			mql.addEventListener("change", callback);
			return () => mql.removeEventListener("change", callback);
		},
		() => (window.matchMedia(query).matches ? "matched" : "unmatched"),
		() => "pending",
	);
