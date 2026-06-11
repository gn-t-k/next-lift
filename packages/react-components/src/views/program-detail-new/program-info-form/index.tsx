"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { type FC, type KeyboardEvent, type SubmitEvent, useState } from "react";
import { Button } from "../../../primitives/button";
import { Label } from "../../../primitives/label";
import { TextArea } from "../../../primitives/text-area";
import { TextField, TextFieldInput } from "../../../primitives/text-field";

type Props = {
	name: string;
	meta: string | null;
	onSubmit: (payload: { name: string; meta: string | null }) => void;
	onCancel: () => void;
};

export const ProgramInfoForm: FC<Props> = ({
	name,
	meta,
	onSubmit,
	onCancel,
}) => {
	const [draftName, setDraftName] = useState(name);
	const [draftMeta, setDraftMeta] = useState(meta ?? "");
	const nextName = draftName.trim();
	const nextMeta = draftMeta.trim();
	const isSubmitDisabled = nextName === "";

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitDisabled) return;
		onSubmit({
			name: nextName,
			meta: nextMeta === "" ? null : nextMeta,
		});
	};
	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			onCancel();
		}
	};

	return (
		<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
			<TextField value={draftName} onChange={setDraftName}>
				<Label>プログラム名</Label>
				<TextFieldInput
					autoFocus
					onFocus={(event) => event.currentTarget.select()}
					onKeyDown={handleKeyDown}
				/>
			</TextField>
			<TextField value={draftMeta} onChange={setDraftMeta}>
				<Label>メモ</Label>
				<TextArea rows={3} onKeyDown={handleKeyDown} />
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
