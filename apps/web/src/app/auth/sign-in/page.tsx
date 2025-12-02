import { type FC, Suspense } from "react";
import {
	AppleSignInButton,
	AppleSignInButtonSkeleton,
} from "./_components/apple-sign-in-button";
import {
	GoogleSignInButton,
	GoogleSignInButtonSkeleton,
} from "./_components/google-sign-in-button";

const Page: FC<PageProps<"/auth/sign-in">> = async ({ searchParams }) => {
	return (
		<main className="flex min-h-screen items-center justify-center p-8">
			<section className="w-full max-w-sm space-y-8">
				<header>
					<h1 className="text-3xl font-bold text-fg">
						サインイン（動作確認用）
					</h1>
				</header>
				<div className="space-y-4">
					<Suspense fallback={<GoogleSignInButtonSkeleton />}>
						<GoogleSignInButton searchParams={searchParams} />
					</Suspense>
					<Suspense fallback={<AppleSignInButtonSkeleton />}>
						<AppleSignInButton searchParams={searchParams} />
					</Suspense>
				</div>
			</section>
		</main>
	);
};

export default Page;
