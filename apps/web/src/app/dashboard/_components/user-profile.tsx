import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "../../../libs/auth";

type User = {
	id: string;
	name: string;
	email: string;
	image: string | null;
};

const getUserSession = async (): Promise<User> => {
	await connection();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth/sign-in");
	}

	return {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
		image: session.user.image ?? null,
	};
};

export const UserProfile = async () => {
	const user = await getUserSession();

	return (
		<article className="space-y-4 rounded-md border border-border bg-secondary p-4">
			<div className="space-y-2">
				<p className="text-sm text-muted-fg">
					<span className="font-semibold text-fg">名前:</span> {user.name}
				</p>
				<p className="text-sm text-muted-fg">
					<span className="font-semibold text-fg">メールアドレス:</span>{" "}
					{user.email}
				</p>
			</div>
			{user.image && (
				<div>
					<Image
						src={user.image}
						alt={user.name}
						width={64}
						height={64}
						className="rounded-full"
					/>
				</div>
			)}
		</article>
	);
};

export const UserProfileSkeleton = () => {
	return (
		<article className="space-y-4 rounded-md border border-border bg-secondary p-4">
			<div className="space-y-2">
				<div className="h-5 w-48 animate-pulse rounded bg-muted" />
				<div className="h-5 w-64 animate-pulse rounded bg-muted" />
			</div>
			<div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
		</article>
	);
};
