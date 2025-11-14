import { GoogleSignInButton } from "./_components/google-sign-in-button";

const LoginPage = () => {
	return (
		<main className="flex min-h-screen items-center justify-center p-8">
			<section className="w-full max-w-sm space-y-8">
				<header>
					<h1 className="text-3xl font-bold text-fg">ログイン（動作確認用）</h1>
				</header>
				<GoogleSignInButton />
			</section>
		</main>
	);
};

export default LoginPage;
