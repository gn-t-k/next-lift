"use client";

import type { ComponentProps, FC } from "react";
import { Button } from "../../primitives/button";
import {
	TextField,
	TextFieldError,
	TextFieldInput,
	TextFieldLabel,
} from "../../primitives/text-field";

type NameFieldProps = {
	name?: string;
	defaultValue?: string;
	isInvalid?: boolean;
	errors?: string[];
};

type Props = {
	formProps?: ComponentProps<"form">;
	nameFieldProps?: NameFieldProps;
	isPending?: boolean;
	submitLabel?: string;
};

export const ProgramCreateForm: FC<Props> = ({
	formProps,
	nameFieldProps,
	isPending,
	submitLabel = "プログラムの設計に進む",
}) => (
	<form {...formProps} className="flex flex-col gap-6">
		<TextField {...nameFieldProps} autoFocus>
			<TextFieldLabel>プログラム名</TextFieldLabel>
			<TextFieldInput placeholder="例: 上半身" />
			<TextFieldError>{nameFieldProps?.errors?.[0]}</TextFieldError>
		</TextField>
		<div className="flex justify-end">
			<Button type="submit" intent="primary" isPending={isPending ?? false}>
				{submitLabel}
			</Button>
		</div>
	</form>
);
