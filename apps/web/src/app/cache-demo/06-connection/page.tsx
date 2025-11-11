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
import { DateComparisonDisplay } from "./_components/date-comparison-display";
import { WithConnectionDisplay } from "./_components/with-connection-display";
import { WithoutConnectionDisplay } from "./_components/without-connection-display";

const Page: FC = async () => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-3xl text-fg">06. connection() API</h1>
				<p className="text-lg text-muted-fg">
					connection()を使用して動的レンダリングを強制し、Math.random()やDate.now()などを正しく扱う方法を示します。
				</p>
			</header>

			<MessageBox variant="muted">
				<MessageBoxTitle>概念</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						<code className="rounded bg-accent px-2 py-1 font-mono">
							connection()
						</code>
						は、レンダリングがユーザーリクエストを待つように指示する関数です。
					</p>
					<p>
						通常、
						<code className="rounded bg-accent px-2 py-1 font-mono">
							Math.random()
						</code>
						や
						<code className="rounded bg-accent px-2 py-1 font-mono">
							Date.now()
						</code>
						はビルド時に評価されてしまいますが、
						<code className="rounded bg-accent px-2 py-1 font-mono">
							connection()
						</code>
						を使うことでリクエスト時に評価されます。
					</p>
					<p>
						Dynamic
						APIを使用していない場合に、動的レンダリングを強制する必要があるときに有効です。
					</p>
				</MessageBoxBody>
			</MessageBox>

			<div className="grid gap-6 md:grid-cols-2">
				<WithoutConnectionDisplay />
				<WithConnectionDisplay />
				<DateComparisonDisplay />
				<DemoCard>
					<DemoCardHeader priority="B">
						<DemoCardTitle>connection()の使用例</DemoCardTitle>
						<DemoCardDescription>
							どんな時にconnection()を使うべきか
						</DemoCardDescription>
					</DemoCardHeader>
					<DemoCardContent>
						<div className="space-y-3">
							<MessageBox variant="accent">
								<strong>✅ 使うべき場合</strong>
								<ul className="mt-2 space-y-1">
									<li>• Math.random()で毎回異なる値が必要</li>
									<li>• Date.now()やnew Date()で現在時刻が必要</li>
									<li>• process.env を実行時に読み取る必要がある</li>
									<li>• その他、リクエストごとに変わる値を扱う場合</li>
								</ul>
							</MessageBox>
							<MessageBox variant="accent">
								<strong>❌ 不要な場合</strong>
								<ul className="mt-2 space-y-1">
									<li>• cookies()、headers()を既に使用している</li>
									<li>• searchParamsを使用している</li>
									<li>• その他のDynamic APIを使用している</li>
									<li>• 静的レンダリングで問題ない場合</li>
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
						<li>各カードの値を確認してください。</li>
						<li>
							ページをリロードして、connection()なしのカードの値が変わらないことを確認してください。
						</li>
						<li>
							connection()ありのカードは、リロードするたびに値が更新されることを確認してください。
						</li>
						<li>
							Date.nowの差分を見て、約100msの差があることを確認してください。
						</li>
					</ol>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
