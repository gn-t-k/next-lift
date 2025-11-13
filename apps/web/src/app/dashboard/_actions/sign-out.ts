"use server";

import { auth } from "@next-lift/authentication/instance";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signOut = async (
	_prevState: unknown,
	_formData: FormData,
): Promise<void> => {
	await auth.api.signOut({
		headers: await headers(),
	});
	updateTag("user-session");
	redirect("/auth/login" as never);
};
