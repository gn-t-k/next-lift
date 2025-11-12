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
import { DynamicStatsDisplay } from "./_components/dynamic-stats-display";
import { StaticHeaderDisplay } from "./_components/static-header-display";
import {
	hybridCode,
	nestedCode,
	staticShellCode,
} from "./_constants/code-examples";

const Page: FC<PageProps<"/cache-demo/03-suspense-boundaries">> = async (
	_props,
) => {
	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-3xl font-bold text-fg">03. Suspense境界との統合</h1>
				<p className="text-muted-fg">
					静的シェルと動的コンテンツを組み合わせて、高速で柔軟なページを構築しましょう。
				</p>
			</header>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>静的シェル + 動的コンテンツ</DemoCardTitle>
					<DemoCardDescription>
						ページの静的部分をキャッシュし、動的部分はSuspenseでストリーミング
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={staticShellCode} title="基本的なパターン" />

						<MessageBox variant="secondary">
							<MessageBoxTitle>実際の動作デモ:</MessageBoxTitle>
							<MessageBoxBody>
								{/* 静的シェル - 即座に表示 */}
								<StaticHeaderDisplay />

								{/* 動的コンテンツ - Suspenseでストリーミング */}
								<DynamicStatsDisplay />

								<p>
									💡
									ページをリロードすると、静的シェルは即座に表示され、動的コンテンツは1秒後にストリーミングで表示されます。
								</p>
							</MessageBoxBody>
						</MessageBox>

						<MessageBox variant="muted">
							<MessageBoxTitle>このパターンのメリット</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-1">
									<li>
										• <strong>初回表示が高速</strong>:
										静的部分はキャッシュから即座に表示
									</li>
									<li>
										• <strong>段階的レンダリング</strong>:{" "}
										準備できた部分から順次表示
									</li>
									<li>
										• <strong>柔軟性</strong>: 静的と動的のバランスを自由に調整
									</li>
									<li>
										• <strong>SEO対策</strong>:
										重要なコンテンツは静的にプリレンダリング
									</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>ネストしたSuspense境界</DemoCardTitle>
					<DemoCardDescription>
						複数のSuspenseを組み合わせて、きめ細かい制御を実現
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={nestedCode} title="ネストしたSuspense" />

						<MessageBox variant="muted">
							<MessageBoxTitle>使用ケース</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-2">
									<li>
										• <strong>ダッシュボード</strong>:{" "}
										各ウィジェットを独立してストリーミング
									</li>
									<li>
										• <strong>商品ページ</strong>:{" "}
										商品情報、レビュー、関連商品を別々に表示
									</li>
									<li>
										• <strong>記事ページ</strong>:{" "}
										本文、コメント、推奨記事を段階的にロード
									</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>

						<MessageBox variant="warning">
							<MessageBoxTitle>⚠️ 注意点</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-1">
									<li>• Suspense境界を細かくしすぎると管理が複雑に</li>
									<li>• スケルトンUIは実際のコンテンツサイズに近づける</li>
									<li>• ネストが深すぎるとパフォーマンスに影響</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>ハイブリッドキャッシング</DemoCardTitle>
					<DemoCardDescription>
						キャッシュされたコンポーネント内に動的コンテンツを配置
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={hybridCode} title="ハイブリッドパターン" />

						<MessageBox variant="muted">
							<MessageBoxTitle>ハイブリッドパターンの特徴</MessageBoxTitle>
							<MessageBoxBody>
								<p>
									「use
									cache」でマークされたコンポーネント内に、Suspenseで囲まれた動的コンテンツを配置できます。
									これにより、レイアウトやナビゲーションなどの静的部分をキャッシュしながら、
									コンテンツの一部を動的に保つことができます。
								</p>
							</MessageBoxBody>
						</MessageBox>

						<MessageBox variant="success">
							<MessageBoxTitle>✅ ベストプラクティス</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-1">
									<li>
										• レイアウトやナビゲーションは「use cache」でキャッシュ
									</li>
									<li>• ユーザー固有のデータはSuspenseで動的に取得</li>
									<li>• スケルトンUIで優れたUXを提供</li>
									<li>• cacheLife()で適切な再検証タイミングを設定</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<MessageBox variant="muted">
				<MessageBoxTitle>フェーズ1完了おめでとうございます!</MessageBoxTitle>
				<MessageBoxBody>
					<p>
						基礎機能（優先度A）をマスターしました。次は実用的な機能（優先度B）に進みましょう。
						cacheTag()による再検証、プライベートキャッシュ、connection()
						APIなど、実際のアプリケーション開発で役立つ機能を学びます。
					</p>
					<div className="mt-4 flex gap-3">
						<a
							href="/cache-demo/04-cache-tags"
							className="inline-block rounded-lg bg-primary px-4 py-2 text-primary-fg hover:opacity-90"
						>
							04. cacheTag()再検証 →
						</a>
						<a
							href="/cache-demo"
							className="inline-block rounded-lg border border-border px-4 py-2 text-fg hover:bg-secondary"
						>
							← デモ一覧に戻る
						</a>
					</div>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
