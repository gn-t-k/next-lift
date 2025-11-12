"use cache";

import {
	CodeBlock,
	DataFieldLabel,
	DataFieldList,
	DataFieldValue,
	DemoCard,
	DemoCardContent,
	DemoCardDescription,
	DemoCardHeader,
	DemoCardTitle,
	MessageBox,
	MessageBoxBody,
	MessageBoxTitle,
	StatusBadge,
} from "@next-lift/react-components/demo";
import type { FC } from "react";
import {
	componentLevelCode,
	fileLevelCode,
	functionLevelCode,
} from "./_constants/code-examples";
import { getFileLevelData } from "./_queries/get-file-level-data";

// ファイルレベルキャッシュのデモ
// このファイル全体が "use cache" ディレクティブでキャッシュされます

const Page: FC<PageProps<"/cache-demo/01-basic-use-cache">> = async (_props) => {
	const data = await getFileLevelData();

	return (
		<main className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-3xl font-bold text-fg">01. 基本的な use cache</h1>
				<p className="text-muted-fg">
					「use
					cache」ディレクティブの3つのレベル（ファイル、コンポーネント、関数）を理解しましょう。
				</p>
			</header>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>ファイルレベルキャッシュ</DemoCardTitle>
					<DemoCardDescription>
						ファイルの先頭に 'use cache'
						を配置すると、ファイル全体がキャッシュされます
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={fileLevelCode} title="ファイルレベルの例" />

						<MessageBox variant="secondary">
							<MessageBoxTitle>実行結果</MessageBoxTitle>
							<StatusBadge status="HIT" timestamp={data.timestamp} />
							<DataFieldList>
								<DataFieldLabel>タイムスタンプ:</DataFieldLabel>
								<DataFieldValue className="font-mono text-fg">
									{data.timestamp}
								</DataFieldValue>
								<DataFieldLabel>ランダム値:</DataFieldLabel>
								<DataFieldValue className="font-mono text-fg">
									{data.value.toFixed(6)}
								</DataFieldValue>
							</DataFieldList>
							<p className="text-sm text-muted-fg">
								💡
								ページをリロードしても、同じタイムスタンプとランダム値が表示されます。
								これはページ全体がキャッシュされているためです。
							</p>
						</MessageBox>

						<MessageBox variant="warning">
							<MessageBoxTitle>⚠️ 重要な動作</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-1">
									<li>• ビルド時に一度だけ実行されます</li>
									<li>• 同じ入力に対して同じ出力を返します</li>
									<li>• cacheLife()で再検証タイミングを制御できます</li>
									<li>• デフォルトでは無期限にキャッシュされます</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>コンポーネントレベルキャッシュ</DemoCardTitle>
					<DemoCardDescription>
						特定のコンポーネントだけをキャッシュしたい場合に使用します
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock
							code={componentLevelCode}
							title="コンポーネントレベルの例"
						/>

						<MessageBox variant="secondary">
							<MessageBoxTitle>使用ケース</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-2">
									<li>
										• <strong>部分的なキャッシング</strong>:{" "}
										ページの一部だけキャッシュしたい
									</li>
									<li>
										• <strong>再利用可能なコンポーネント</strong>:{" "}
										複数のページで共通して使うコンポーネント
									</li>
									<li>
										• <strong>条件付きレンダリング</strong>:{" "}
										表示される場合のみキャッシュ
									</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>
					</div>
				</DemoCardContent>
			</DemoCard>

			<DemoCard>
				<DemoCardHeader priority="A">
					<DemoCardTitle>関数レベルキャッシュ</DemoCardTitle>
					<DemoCardDescription>
						データ取得関数の結果をキャッシュする最も細かい制御
					</DemoCardDescription>
				</DemoCardHeader>
				<DemoCardContent>
					<div className="space-y-4">
						<CodeBlock code={functionLevelCode} title="関数レベルの例" />

						<MessageBox variant="secondary">
							<MessageBoxTitle>使用ケース</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-2">
									<li>
										• <strong>API呼び出し</strong>:
										外部APIのレスポンスをキャッシュ
									</li>
									<li>
										• <strong>重い計算</strong>: 計算結果を再利用
									</li>
									<li>
										• <strong>データベースクエリ</strong>:{" "}
										同じクエリ結果をキャッシュ
									</li>
								</ul>
							</MessageBoxBody>
						</MessageBox>

						<MessageBox variant="success">
							<MessageBoxTitle>✅ ベストプラクティス</MessageBoxTitle>
							<MessageBoxBody>
								<ul className="space-y-1">
									<li>
										• 関数レベルは最も細かい制御ができるため、推奨されます
									</li>
									<li>• 関数の引数がキャッシュキーとして使われます</li>
									<li>
										• 複数の場所から同じ関数を呼んでもキャッシュを共有します
									</li>
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
						基本的な「use
						cache」の使い方を理解したら、次は「cacheLife()」でキャッシュの有効期限を制御する方法を学びましょう。
					</p>
					<a
						href="/cache-demo/02-cache-life"
						className="inline-block text-primary hover:underline"
					>
						02. cacheLife() プロファイル →
					</a>
				</MessageBoxBody>
			</MessageBox>
		</main>
	);
};

export default Page;
