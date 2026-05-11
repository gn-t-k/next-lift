import type { FC } from "react";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Props = {
	index: number;
};

export const SetPlanRowEmpty: FC<Props> = ({ index }) => (
	<SetPlanRowFrame index={index} display="値未入力" tone="muted" />
);
