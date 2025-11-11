import {
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
} from "@next-lift/react-components/demo";
import type { FC } from "react";
import { Suspense } from "react";
import {
	DeviceInfoDisplay,
	DeviceInfoDisplayFallback,
} from "./_components/device-info-display";
import {
	UserGreetingDisplay,
	UserGreetingDisplayFallback,
} from "./_components/user-greeting-display";
import { UsernameForm } from "./_components/username-form";

const Page: FC = async () => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-3xl text-fg">
					05. プライベートキャッシュ
				</h1>
				<p className="text-lg text-muted-fg">
					'use cache:
					private'を使用してcookies()、headers()などのランタイムAPIにアクセスしながらキャッシュする方法を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						通常の
						<code className="rounded bg-accent px-2 py-1 font-mono">
							use cache
						</code>
						では、
						<code className="rounded bg-accent px-2 py-1 font-mono">
							cookies()
						</code>
						や
						<code className="rounded bg-accent px-2 py-1 font-mono">
							headers()
						</code>
						などのランタイムAPIを使用できません。
					</p>
					<p>
						<code className="rounded bg-accent px-2 py-1 font-mono">
							'use cache: private'
						</code>
						を使用すると、これらのAPIにアクセスしながらもキャッシュを有効にできます。
					</p>
					<p>
						キャッシュはユーザーごとに分離され、プライバシーが保護されます。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<Suspense fallback={<UserGreetingDisplayFallback />}>
					<UserGreetingDisplay />
				</Suspense>

				<Suspense fallback={<DeviceInfoDisplayFallback />}>
					<DeviceInfoDisplay />
				</Suspense>

				<UsernameForm />

				<DemoCard>
					<DemoCardHeader priority="B">
						<DemoCardTitle>use cacheとの違い</DemoCardTitle>
						<DemoCardDescription>
							通常のuse cacheでは使えない機能
						</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<strong>❌ use cache</strong>
								<ul className="mt-2 space-y-1">
									<li>• cookies()使用不可</li>
									<li>• headers()使用不可</li>
									<li>• searchParams使用不可</li>
									<li>• 全ユーザーで共有</li>
								</ul>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>✅ 'use cache: private'</strong>
								<ul className="mt-2 space-y-1">
									<li>• cookies()使用可能</li>
									<li>• headers()使用可能</li>
									<li>• searchParams使用可能</li>
									<li>• ユーザーごとに分離</li>
								</ul>
							</MessageBox>
						</div>
					</DemoCardContent>
				</DemoCard>
			</div>

			<MessageBox variant="muted">
				<MessageBoxTitle>試してみよう</MessageBoxTitle>
				<MessageBoxBody>
					<ol className="list-inside list-decimal space-y-2">
						<li>各カードのキャッシュ時刻を確認してください。</li>
						<li>
							ユーザー名を設定し、ユーザー情報カードが更新されることを確認してください。
						</li>
						<li>
							ページをリロードしても、キャッシュ時刻が変わらないことを確認してください。
						</li>
						<li>
							別のブラウザやシークレットモードで開くと、異なるキャッシュが使われることを確認できます。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
