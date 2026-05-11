export const findEditDialog = (): HTMLElement | null =>
	document.querySelector<HTMLElement>('[role="dialog"]');

export const requireEditDialog = (): HTMLElement => {
	const dialog = findEditDialog();
	if (dialog === null) throw new Error("edit dialog not found");
	return dialog;
};

export const findButtonInDialogByName = (
	name: string | RegExp,
): HTMLElement | undefined =>
	Array.from(
		requireEditDialog().querySelectorAll<HTMLButtonElement>("button"),
	).find((el) => {
		const elName =
			el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
		return typeof name === "string" ? elName === name : name.test(elName);
	});

export const requireButtonInDialogByName = (
	name: string | RegExp,
): HTMLElement => {
	const el = findButtonInDialogByName(name);
	if (el === undefined)
		throw new Error(`button with name "${name}" not found in edit dialog`);
	return el;
};

export const findInputByLabel = (label: string): HTMLInputElement => {
	const dialog = requireEditDialog();
	const labelEl = Array.from(
		dialog.querySelectorAll<HTMLElement>("label"),
	).find((l) => l.textContent === label);
	if (labelEl === undefined) throw new Error(`label "${label}" not found`);
	const id = labelEl.getAttribute("for");
	if (id === null) throw new Error(`label "${label}" has no associated input`);
	const input = dialog.querySelector<HTMLInputElement>(`#${CSS.escape(id)}`);
	if (input === null) throw new Error(`input for label "${label}" not found`);
	return input;
};
