"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const setUsername = async (username: string) => {
	const cookieStore = await cookies();
	cookieStore.set("demo-username", username, {
		maxAge: 60 * 60 * 24 * 7, // 7日間
		httpOnly: true,
		sameSite: "lax",
	});

	revalidatePath("/cache-demo/05-private-cache");
};
