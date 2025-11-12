"use server";

import { revalidateTag } from "next/cache";

export const revalidatePostsTag = async () => {
	revalidateTag("posts", "default");
};
