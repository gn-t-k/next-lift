"use server";

import { revalidateTag } from "next/cache";

export const revalidateAllTags = async () => {
	revalidateTag("user", "default");
	revalidateTag("posts", "default");
};
