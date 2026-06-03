import { filterByName } from "./filter-by-name";
import { isCreatableName } from "./is-creatable-name";

export const PLACEHOLDER_ID = "__placeholder__";
export const CREATE_ID = "__create__";

export type ComboBoxItem =
	| { kind: "option"; id: string; name: string }
	| {
			kind: "placeholder";
			id: typeof PLACEHOLDER_ID;
			reason: "empty" | "no-match";
	  }
	| { kind: "create"; id: typeof CREATE_ID };

export const buildComboBoxItems = ({
	options,
	query,
}: {
	options: { id: string; name: string }[];
	query: string;
}): ComboBoxItem[] => {
	const items: ComboBoxItem[] = [];

	if (options.length === 0) {
		items.push({
			kind: "placeholder",
			id: PLACEHOLDER_ID,
			reason: "empty",
		});
	} else {
		const filtered = filterByName(options, query);
		if (filtered.length === 0) {
			items.push({
				kind: "placeholder",
				id: PLACEHOLDER_ID,
				reason: "no-match",
			});
		} else {
			for (const option of filtered) {
				items.push({ kind: "option", id: option.id, name: option.name });
			}
		}
	}

	const existingNames = options.map((o) => o.name);
	if (isCreatableName(existingNames, query)) {
		items.push({ kind: "create", id: CREATE_ID });
	}

	return items;
};
