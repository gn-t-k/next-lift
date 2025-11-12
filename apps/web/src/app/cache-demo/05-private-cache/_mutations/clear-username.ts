"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const clearUsername = async () => {
	const cookieStore = await cookies();
	cookieStore.delete("demo-username");

	revalidatePath("/cache-demo/05-private-cache");
};
