"use server";

import { revalidateTag } from "next/cache";

export const revalidateCachedData = async (_prevState: null) => {
	revalidateTag("cached-api-data", "default");
	return null;
};
