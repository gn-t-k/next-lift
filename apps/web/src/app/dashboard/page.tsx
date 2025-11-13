import { Suspense } from "react";
import { SignOutButton } from "./_components/sign-out-button";
import { UserProfile, UserProfileSkeleton } from "./_components/user-profile";

const DashboardPage = () => {
	return (
		<main className="min-h-screen p-8">
			<div className="mx-auto max-w-2xl space-y-8">
				<header>
					<h1 className="text-3xl font-bold text-fg">ダッシュボード</h1>
				</header>
				<section>
					<Suspense fallback={<UserProfileSkeleton />}>
						<UserProfile />
					</Suspense>
				</section>
				<SignOutButton />
			</div>
		</main>
	);
};

export default DashboardPage;
