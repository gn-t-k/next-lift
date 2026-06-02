import { cn } from "../../libs/utils";

export const surfaceCardClass = cn(
	"rounded-lg bg-overlay text-overlay-fg no-underline shadow-sm outline-none transition-all",
	"hover:bg-secondary hover:shadow-md",
	"focus-visible:bg-secondary focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
);
