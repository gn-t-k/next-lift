import {
	CodeBlock,
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
import { CustomDemo } from "./_components/custom-demo";
import { HoursDemo } from "./_components/hours-demo";
import { MinutesDemo } from "./_components/minutes-demo";
import { SecondsDemo } from "./_components/seconds-demo";
import { configCode, customCode, presetCode } from "./_constants/code-examples";

const Page: FC = () => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-3xl font-bold text-fg">
					02. cacheLife() プロファイル
				</h1>
				<p className="text-muted-fg">
					cacheLife()を使ってキャッシュの有効期限を制御する方法を学びましょう。
				</p>
			</header>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>プリセットプロファイル</DemoCardTitle>
					<DemoCardDescription>
						よく使われるキャッシュ期間があらかじめ定義されています
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={presetCode} title="プリセットプロファイルの使用" />

						<div className="space-y-3">
							<Suspense
								fallback={
									<MessageBox variant="secondary">
										<MessageBoxTitle>seconds プロファイル</MessageBoxTitle>
										<MessageBoxBody>
											<p className="text-muted-fg">読み込み中...</p>
										</MessageBoxBody>
									</MessageBox>
								}
							>
								<SecondsDemo />
							</Suspense>

							<Suspense
								fallback={
									<MessageBox variant="secondary">
										<MessageBoxTitle>minutes プロファイル</MessageBoxTitle>
										<MessageBoxBody>
											<p className="text-muted-fg">読み込み中...</p>
										</MessageBoxBody>
									</MessageBox>
								}
							>
								<MinutesDemo />
							</Suspense>

							<Suspense
								fallback={
									<MessageBox variant="secondary">
										<MessageBoxTitle>hours プロファイル</MessageBoxTitle>
										<MessageBoxBody>
											<p className="text-muted-fg">読み込み中...</p>
										</MessageBoxBody>
									</MessageBox>
								}
							>
								<HoursDemo />
							</Suspense>
						</div>

						<MessageBox variant="muted">
							<MessageBoxTitle>利用可能なプリセット</MessageBoxTitle>
							<MessageBoxBody>
								<div className="grid gap-2">
									<div className="flex justify-between">
										<code className="text-primary">seconds</code>
										<span>短時間（頻繁に更新）</span>
									</div>
									<div className="flex justify-between">
										<code className="text-primary">minutes</code>
										<span>中期間（定期更新）</span>
									</div>
									<div className="flex justify-between">
										<code className="text-primary">hours</code>
										<span>長期間（低頻度更新）</span>
									</div>
									<div className="flex justify-between">
										<code className="text-primary">days</code>
										<span>日単位（ほぼ静的）</span>
									</div>
									<div className="flex justify-between">
										<code className="text-primary">weeks</code>
										<span>週単位（静的コンテンツ）</span>
									</div>
									<div className="flex justify-between">
										<code className="text-primary">max</code>
										<span>最長期間（完全に静的）</span>
									</div>
								</div>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>カスタムプロファイル（インライン）</DemoCardTitle>
					<DemoCardDescription>
						より細かい制御が必要な場合は、カスタム設定を使用します
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={customCode} title="カスタムプロファイルの定義" />

						<Suspense
							fallback={
								<MessageBox variant="secondary">
									<MessageBoxTitle>カスタム設定の結果</MessageBoxTitle>
									<MessageBoxBody>
										<p className="text-muted-fg">読み込み中...</p>
									</MessageBoxBody>
								</MessageBox>
							}
						>
							<CustomDemo />
						</Suspense>

						<MessageBox variant="muted">
							<MessageBoxTitle>
								カスタムプロファイルのパラメータ
							</MessageBoxTitle>
							<MessageBoxBody>
								<dl className="space-y-2">
									<div>
										<dt className="font-semibold">
											<code>stale</code> (秒)
										</dt>
										<dd className="ml-4">
											この時間後にコンテンツがstale（古い）とマークされる
										</dd>
									</div>
									<div>
										<dt className="font-semibold">
											<code>revalidate</code> (秒)
										</dt>
										<dd className="ml-4">
											この時間後にバックグラウンドで再検証が開始される
										</dd>
									</div>
									<div>
										<dt className="font-semibold">
											<code>expire</code> (秒)
										</dt>
										<dd className="ml-4">
											この時間後にキャッシュが完全に期限切れになる
										</dd>
									</div>
								</dl>
							</MessageBoxBody>
						</MessageBox>

						<MessageBox variant="info">
							<MessageBoxTitle>
								💡 stale-while-revalidate パターン
							</MessageBoxTitle>
							<MessageBoxBody>
								<p>
									stale期間中は古いコンテンツを返しながら、バックグラウンドで新しいデータを取得します。
									これにより、ユーザーは待たされることなく、常に高速なレスポンスを得られます。
								</p>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>next.config.tsでのプロファイル定義</DemoCardTitle>
					<DemoCardDescription>
						アプリケーション全体で再利用できるプロファイルを定義
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock
							code={configCode}
							title="next.config.tsでのカスタムプロファイル定義"
						/>

						<MessageBox variant="muted">
							<MessageBoxTitle>使用例</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-2">
									<li>
										• <strong>ブログ記事</strong>:{" "}
										<code className="text-primary">days</code> または{" "}
										<code className="text-primary">weeks</code>
									</li>
									<li>
										• <strong>ダッシュボード</strong>:{" "}
										<code className="text-primary">minutes</code>
									</li>
									<li>
										• <strong>リアルタイムデータ</strong>:{" "}
										<code className="text-primary">seconds</code>{" "}
										または動的レンダリング
									</li>
									<li>
										• <strong>静的コンテンツ</strong>:{" "}
										<code className="text-primary">max</code>
									</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>

						<MessageBox variant="success">
							<MessageBoxTitle>✅ ベストプラクティス</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-1">
									<li>
										• コンテンツの更新頻度に応じて適切なプロファイルを選択
									</li>
									<li>
										• stale期間は短く、expire期間は長めに設定するとUXが向上
									</li>
									<li>• よく使う設定はnext.config.tsで定義して再利用</li>
									<li>• パフォーマンスとデータの鮮度のバランスを考慮</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<MessageBox variant="muted">
				<MessageBoxTitle>次のステップ</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						cacheLife()によるキャッシュ制御を理解したら、次はSuspense境界と組み合わせた部分的プリレンダリングを学びましょう。
					</p>
					<a
						href="/cache-demo/03-suspense-boundaries"
						className="mt-3 inline-block text-primary hover:underline"
					>
						03. Suspense境界との統合 →
					</a>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
