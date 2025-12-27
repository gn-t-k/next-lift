import { type FC, Suspense } from "react";
import { AppleSignInButton } from "./_components/apple-sign-in-button";
import { AuthErrorAlert } from "./_components/auth-error-alert";
import { GoogleSignInButton } from "./_components/google-sign-in-button";

const Page: FC<PageProps<"/auth/sign-in">> = async ({ searchParams }) => {
	return (
		<main className="flex min-h-screen items-center justify-center p-8">
			<section className="w-full max-w-sm space-y-8">
				<header>
					<h1 className="text-3xl font-bold text-fg">
						サインイン（動作確認用）
					</h1>
				</header>
				<Suspense fallback={null}>
					<AuthErrorAlert searchParams={searchParams} />
				</Suspense>
				<div className="space-y-4">
					<GoogleSignInButton />
					<AppleSignInButton />
				</div>
			</section>
		</main>
	);
};

export default Page;
