"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { type FC, type KeyboardEvent, type SubmitEvent, useState } from "react";
import { Button } from "../../../primitives/button";
import { TextField, TextFieldInput } from "../../../primitives/text-field";

type Props = {
	label: string;
	onSubmit: (label: string) => void;
	onCancel: () => void;
};

export const DayLabelForm: FC<Props> = ({ label, onSubmit, onCancel }) => {
	const [draft, setDraft] = useState(label);
	const nextLabel = draft.trim();
	const isSubmitDisabled = nextLabel === "";

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isSubmitDisabled) {
			onSubmit(nextLabel);
		}
	};
	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			onCancel();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<TextField
				aria-label={`${label}のラベル`}
				value={draft}
				onChange={setDraft}
			>
				<TextFieldInput
					autoFocus
					onFocus={(event) => event.currentTarget.select()}
					onKeyDown={handleKeyDown}
				/>
			</TextField>
			<div className="flex justify-end gap-2">
				<Button type="button" intent="plain" size="sm" onPress={onCancel}>
					キャンセル
				</Button>
				<Button
					type="submit"
					intent="primary"
					size="sm"
					isDisabled={isSubmitDisabled}
					className="[--btn-icon:var(--btn-fg)]"
				>
					<CheckIcon data-slot="icon" className="size-4" aria-hidden />
					確定
				</Button>
			</div>
		</form>
	);
};
