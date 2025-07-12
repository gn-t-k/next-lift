import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** @public */
export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};
