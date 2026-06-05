import { cn } from "../../libs/utils";
import { createAffordanceClass } from "../../primitives/create-affordance";

// SetPlanRow / SetPlanQuickAddButton の本体とローディングで共有するレイアウト（ズレ・二重保守を防ぐ）
export const setPlanRowClass = "flex items-baseline gap-3 px-3 py-2 text-sm";

export const setPlanIndexClass =
	"w-8 shrink-0 text-muted-fg text-xs tabular-nums";

export const setPlanAddAffordanceClass = cn(
	createAffordanceClass,
	"flex items-baseline gap-3 rounded-md px-[calc(--spacing(3)-1px)] py-[calc(--spacing(2)-1px)] text-left text-sm",
);
