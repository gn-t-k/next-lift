import type { FC } from "react";
import { SetPlanRowDeleteButton } from "./set-plan-row-delete-button";
import { SetPlanRowFrame } from "./set-plan-row-frame";

type Props = {
	index: number;
	exerciseName: string;
	onDelete: () => void;
};

export const SetPlanRowEmpty: FC<Props> = ({
	index,
	exerciseName,
	onDelete,
}) => (
	<SetPlanRowFrame
		index={index}
		display={<span className="text-muted-fg">値未入力</span>}
		menu={
			<SetPlanRowDeleteButton
				label={`${exerciseName} ${index + 1}セット目を削除`}
				onPress={onDelete}
			/>
		}
	/>
);
