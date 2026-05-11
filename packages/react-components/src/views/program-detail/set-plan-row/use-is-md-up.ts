"use client";

import { useEffect, useState } from "react";

const MD_MIN_WIDTH_PX = 768;

export const useIsMdUp = (): boolean => {
	const [isMdUp, setIsMdUp] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia(`(min-width: ${MD_MIN_WIDTH_PX}px)`);
		setIsMdUp(mql.matches);
		const handler = (event: MediaQueryListEvent) => setIsMdUp(event.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);
	return isMdUp;
};
