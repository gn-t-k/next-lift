# 単位ビュー実装 タスク分解

## ステータス

- ステータス: **確定**（2026-05-02、設計判断 #54〜#60 で 2-3 / 2-4 / 2-5 を再構成、2-6 (V16 プログラム新規作成) / 2-7 (V17 Day新規作成) を新設。同日、旧 2-4 (V3 Day 詳細) を 2-3 配下に統合再分解し 22 タスクに展開。2026-05-03、Drawer primitive を 2-3-6.5 として追加: 設計判断 #57 で「狭画面=Drawer」が確定要件のため、ComboBox とは別 primitive として独立、画面幅切替は view 層責務とする。2026-05-05、2-3-8 の picker 統合を 2-3-12 種目計画追加へ統合。`exercise === null` の auto-show は「種目選択は能動操作（インライン編集または追加）であるべき」「プログラム詳細通常閲覧では null は実質発生しない」という観点から後送り。ExerciseSelector 自体（picker UI）は単独コンポーネント + stories として用意済み。同日設計判断 #61 として「V2 プログラム詳細は保存済みデータのみ表示する。新規作成フロー直後は V17 Day新規作成 から V2 へ遷移する時点で全フィールドが充足済み」を確定。`exercise === null` / Day 0 件は (a) 種目計画追加 (2-3-12) 直後の transient state、(b) 全削除後のエッジケース、のみで発生する）
- 現在のフェーズ: 5/5 完了
- 葉タスク: ~121件（2-3 配下に旧 2-4 (Day 内容) を統合し 22 タスクに再分解、Drawer 2-3-6.5 を追加。実装着手時に各セクションで詳細分解）。完了済 (31件): 1-1, 1-2, 1-3, 1-4, 2-1-1, 2-1-2, 2-1-3, 2-1-4, 2-1-5, 2-1-6, 2-1-7, 2-2-1, 2-3-1, 2-3-2, 2-3-3, 2-3-4, 2-3-5, 2-3-6, 2-3-6.5, 2-3-7, 2-3-8, 2-3-9, 2-3-10, 2-3-11, 2-3-12, 2-3-13, 2-3-14, 2-3-15, 2-3-16, 2-3-17, 2-3-18
- 未展開ノード: 0件
- 次のアクション: 2-3-19 V13（種目詳細）への遷移 + ストーリー

## 要件サマリー

### 分解対象

`docs/project/ui-design/` に定義された **単位ビュー（V1〜V15、V7・V14廃止で計13本）** を `packages/react-components/` パッケージに実装する。

### 単位ビュー一覧

| # | ビュー名 | 主な概念オブジェクト | コンテキスト | プラットフォーム |
|---|---------|----------------------|--------------|----------------|
| V1 | プログラム一覧 | Program | ジム外 | iOS / Web |
| V2 | プログラム詳細 | Program, Day | ジム外 | iOS / Web |
| V3 | Day詳細 | Day, ExercisePlan, SetPlan | ジム外 | iOS / Web |
| V4 | 種目選択 | Exercise | ジム外 | iOS / Web |
| V5+V8 | ワークアウト開始+履歴 | Program, Day, Workout | ジム内（開始部分） | iOS / Web |
| V6 | セット記録 | SetRecord, ExerciseRecord | ジム内 | iOS / Web |
| V9 | ワークアウト詳細 | Workout, ExerciseRecord, SetRecord | 両方（呼び出し元による） | iOS / Web |
| V10 | 計画実績比較 | SetPlan, SetRecord, ExercisePlan, ExerciseRecord | ジム外 | iOS / Web |
| V11 | 推移グラフ | Exercise, SetRecord, 1RM | ジム外 | iOS / Web |
| V12 | 種目一覧 | Exercise, 1RM | ジム外 | iOS / Web |
| V13 | 種目詳細 | Exercise, 1RM | 両方（呼び出し元による） | iOS / Web |
| V15 | Day種目推移 | Exercise, SetRecord | ジム外 | Web限定 |

※ V14 (プログラム作成) は設計判断 #53 により撤廃。プログラム新規作成 (UC_A_1) は V2 のインライン編集に統合し、V1 → V2 直接遷移とする。

### コードベース現状

- `packages/react-components/src/ui/`: 既存プリミティブは Button, Dialog, Modal, Link, ErrorAlert, GymContext のみ
- `packages/react-components/src/demo/`: Storybook用デモコンポーネント（DataField, MessageBox, SkeletonLoading, StatusBadge, TimestampValue, DemoCard, CodeBlock）
- Storybook: 起動済み、Button/Modalのストーリー存在
- Intent UI（React Aria Components）+ Tailwind v4 + `pnpm ui:fetch` で追加していくcopy-and-ownモデル
- ADR-023: `.context-gym` クラスで密度トークンを切り替え。`GymContext` コンポーネントで宣言
- 種目データ、プログラムデータ等のドメイン型は未定義（Drizzleスキーマも未確認）
- `packages/react-native-components/` は未作成。iOS向け実装は本スコープ外

### 関連ADR

- ADR-014 Intent UI（React Aria Components, copy-and-own）
- ADR-015 Tailwind CSS v4
- ADR-016 tailwind-config package
- ADR-023 コンテキスト依存UIスタイリング（`.context-gym`, 密度トークン, タイポスケール）

## 設計概要

### スコープ

- **対象パッケージ**: `packages/react-components/`（React DOM / Web向け）
- **対象ビュー**: V1〜V15（V7・V14廃止で13本すべて）
- **対象外**: iOS向け（`packages/react-native-components/` は未作成、別スコープ）、データ取得/状態管理（apps/web側の責務）

### コンポーネント階層

2層 + コロケーション + 昇格ルール。詳細は [ADR-024](../../architecture-decision-record/024-primitive-layer-policy.md) を参照。

1. **プリミティブ層** (`src/primitives/`)
   - 意見を持たない、アクセシビリティと基本挙動を提供するコンポーネント
   - 判別基準: **ドメイン用語（Program / Day / ExercisePlan / SetPlan / Workout / Exercise / 1RM など）を名前に含まない**
   - ベース技術: React Aria Components + Tailwind v4
   - Intent UI は「起点テンプレート」として使う。`pnpm ui:fetch` で追加後、意見が混入していれば剥がす / React Aria から書き直す
   - 例: Button, TextField, NumberField, Card, Tabs, ListBox, Menu, Toast, SearchField
2. **ビュー層** (`src/views/`)
   - V1〜V15 に対応するナビゲーション目的地
   - ビュー本体は `src/views/{ビュー名}/{ビュー名}.tsx`（`coding-style.md`「ファイル名と export する関数/コンポーネント名を揃える」原則）。`index.ts` はバレル専用
   - ビュー専用のサブコンポーネント（ProgramListItem、SetPlanRow 等）は **最初に使うビューのディレクトリ配下にコロケーション**
     - 例: `src/views/program-list/program-list.tsx`, `src/views/program-list/program-list-item.tsx`
   - 状態バリアント（loading / error 等）は別コンポーネントに分離し、`{ビュー名}-{状態}.tsx` として配置（`index.ts` から再エクスポート）
   - **昇格ルール**: 2件目のビューで使いたくなった時点で、次のいずれかに昇格させる
     - ドメイン用語を剥がして汎用化できる → `src/primitives/` に昇格（一般名に改名）
     - ドメイン用語を保ったまま共有される → `src/views/` 直下に昇格
   - 判別基準:
     1. V1〜V15 のどれかに対応する → `src/views/{ビュー名}/{ビュー名}.tsx`
     2. ビューの状態バリアント → `src/views/{ビュー名}/{ビュー名}-{状態}.tsx`
     3. 特定ビュー専用のサブコンポーネント → `src/views/{ビュー名}/` 配下にコロケーション
     4. 複数ビューで使われるドメイン部品 → `src/views/` 直下（昇格後）
     5. ドメイン用語を含まない汎用部品 → `src/primitives/`

既存の `src/ui/` はフェーズ4の基盤整備タスクで `src/primitives/` にリネームする。

### Props設計方針

- ビュー層・ドメインコンポーネント層ともに **「ビューにとって都合のよい型」** を props として受け取る
- 「ドメイン型」（アプリ側で持つ可能性がある、DBスキーマ由来の型など）を直接受け取らない
- ドメイン型からビューpropsへの整形は **apps/web 側の責務**
- `react-components` は純粋なプレゼンテーショナルレイヤーとする

### レスポンシブ対応

- 1つのビューコンポーネントで Tailwind のメディアクエリ（`md:`, `lg:` など）を使って小画面/大画面のレイアウトを切り替える
- 小画面: モバイルSafari等を想定した1カラム中心
- 大画面: サイドバー + メイン、またはマルチペイン構成
- iOSネイティブ（ボトムタブなど）は本パッケージでは実装しない

### ジム内/外コンテキスト（GymContext）

ADR-023 に従う:

- `.context-gym` クラスによる密度トークン切り替えを利用
- 密度依存クラス（`text-density-label`, `text-density-value`, `p-density-card` など）を使う
- `GymContext` の宣言位置:
  - **常にジム内のビュー** (V6, V5+V8のワークアウト開始部分): ビュー内部で `GymContext` をラップ
  - **呼び出し元によって切り替わるビュー** (V9, V13): ビュー本体は1つ、`GymContext` の宣言は呼び出し元の責務
- 画面幅とジム内/外コンテキストは直交する

### 未確定事項の扱い

NOTE-1〜3（V15表示形式、アドホックワークアウトUI、空状態サンプルコンテンツ）は **各ビュー実装タスク内で UI詳細を確定** する。タスク分解時点では確定させない。

### インライン編集の発見性 (V2 / V3 / V13 共通)

`design-principles.md` の方針 (速度優先 + 自動保存 + アニメーション控えめ) に基づき、インライン編集ビュー (V2 プログラム名/メタ情報、V3 Day ラベル/セット計画、V13 種目名/1RM) は「タップ → input が現れる → blur で確定」の純インラインパターンを採用する。

特に V2 のプログラム名は、設計判断 #53 により **新規作成 (UC_A_1) と既存編集 (UC_A_6) の両方で同じインライン編集 UI を使う**。V1 → V2 直接遷移直後は name が空 (or "未設定" 等のプレースホルダー) で、ユーザーがタップして初回入力する流れ。

ただし純インラインは**発見性 (タップ可能と分かるか)** と**確定性 (blur 事故)** に課題があるため、各実装タスクで以下を確定する:

- **静的状態の視覚ヒント**: hover 背景色変化、focus ring、編集可能であることの控えめな視覚的印 (under-line / dashed border 等)
- **確定/キャンセル操作**: Enter / blur で確定、Escape でキャンセル
- **確定時のフィードバック**: 控えめなアニメーション or トーストで「保存された」を構造的に示す
- **空文字 / バリデーションエラー時の挙動**: 元の値に戻す or input に留めてエラー表示
- **サーバーエラー時**: 楽観的更新 + 失敗時 rollback + トースト
- **新規作成直後の name 空状態**: V2 表示時にプレースホルダーとして「プログラム名を入力」等を表示し、ユーザーをインライン編集に誘導

タスク 2-3-4 (V2 プログラム名/メタ情報のインライン編集) で具体仕様を確定し、以降のインライン編集タスクはそれを踏襲する。

### Storybook方針

各ビューに対し、以下の **基本4状態** のストーリーを作成する:

| 状態 | 該当するビュー |
|------|----------------|
| 通常（データあり） | 全ビュー |
| 空（データなし） | データ可変のビュー（リスト系、初回利用時） |
| ローディング | データ取得を伴うビュー（ほぼ全て） |
| エラー | データ取得を伴うビュー（ほぼ全て） |

純プレゼンテーショナルの立場から、`isLoading` や `error` といった props を受け取るか、表示バリアントとして設計する（ビューごとに最適な形を選ぶ）。

ストーリーには iOSサイズ（375px）と Webサイズ（1280px以上）の Viewport 設定を用意する。

### リストビューのページング方針

リスト系ビュー（V1 プログラム一覧、V5+V8 履歴、V12 種目一覧、V9 の種目記録・セット記録、V11 の時系列データ等）は、**実装時にリストごとに方針を決定** する。

判断要素:
- データ増加速度（長期利用で数百〜数千に到達する可能性: ワークアウト履歴、セット記録）
- データ上限（ほぼ増えない: プログラム、種目）
- ページ位置の状態保持の必要性（URL反映、スクロール復元）
- UX（モバイル自然 or フォーカス保持重視）

候補: 無限スクロール / Load More ボタン / ページネーション / 分割不要（全件表示）

各リスト系ビューの実装タスク内に「ページング戦略の確定」サブタスクを含める。

### ADR化済みの設計判断

- [ADR-024: プリミティブ層ポリシーと2層 + 昇格ルール](../../architecture-decision-record/024-primitive-layer-policy.md) — Intent UI の扱い、React Aria を真のベースとする方針、2層 + コロケーション + 昇格ルール

### ADR化の候補

フェーズ4のタスクツリー内で、以下をADRとして記録することを検討する:

- チャートライブラリの選定（V11 推移グラフ実装時）

## タスクツリー

### 依存関係と実装順序

| # | 機能単位 | 依存 | 理由 |
|---|---------|------|------|
| 1 | 基盤整備 | - | 他すべてのビュー実装の前提。プリミティブと方針を確立 |
| 2 | プログラム計画フロー | 1 | 中核ドメインであり、プリミティブ層の検証にもなる。V14 撤廃 (設計判断 #53)、V3 を V2 に統合 (設計判断 #56)、V4 を V2 内 ComboBox に集約 (設計判断 #57)、新規作成は V16 → V17 (設計判断 #54/#55) |
| 3 | ワークアウト記録フロー | 1, 2（V2/V3の構造を流用可能） | ジム内コンテキスト（GymContext）の初検証。V5+V8→V6→V9の順 |
| 4 | 種目管理フロー | 1, 2（種目はV3から参照される）、3（V6からも参照） | V13は複数経路から到達されるため、基本呼び出し元を先に作っておく |
| 5 | 分析フロー | 1, 2, 3, 4（V10はV2/V9から、V11はV13から、V15はV3から到達） | 呼び出し元がすべて揃ってから着手 |

推奨実装順: 1 → 2 → 3 → 4 → 5（上から順）

### タスクツリー

#### 1. 基盤整備

- [x] 1-1. プリミティブ層ポリシーのADR作成（完了: ADR-024）
  - 説明: Intent UI を起点テンプレート扱いし、React Aria Components を真のベースとする方針をADR化。2層 + コロケーション + 昇格ルールを含む
  - 完了条件: `docs/architecture-decision-record/024-primitive-layer-policy.md` が作成され、README.md に追加済み
- [x] 1-2. `src/ui/` → `src/primitives/` リネーム
  - 説明: 既存の button / dialog / modal / link / error-alert / gym-context および stories ファイルを `src/primitives/` に移動。import参照の更新、`package.json` の exports、components.json の registries パスも調整
  - 完了条件: `pnpm type-check` `pnpm lint` `pnpm build` が全パッケージでグリーン。Storybookが起動し既存ストーリーが表示される
- [x] 1-3. `src/views/` ディレクトリと `index.ts` を新規作成
  - 説明: ビュー層のディレクトリを立ち上げる。`src/views/index.ts` はV1〜V15の再エクスポート空雛形
  - 完了条件: `packages/react-components/src/views/index.ts` が存在し、空でエクスポートが通る
- [x] 1-4. `packages/react-components/CLAUDE.md` を更新
  - 説明: `src/primitives/` と `src/views/` の配置基準、昇格ルール（2件目のビューでの `views/` 直下または `primitives/` への昇格）を追記。詳細は ADR-024 を参照する旨も明記
  - 完了条件: 新規開発者が CLAUDE.md を読むだけで振り分け判断ができる記述になっている

#### 2. プログラム計画フロー

##### 2-1. V1 プログラム一覧

- [x] 2-1-1. propsインターフェース設計 + 通常状態（0件以外）のストーリー
  - 説明: `ProgramListItem`（コロケーション）と V1 本体の骨格を実装。通常ストーリー（複数件）でレイアウトを固定。各カードは Link primitive で V2 への遷移リンクとして実装し、複製・削除メニューは V2 に集約する方針を採用（views-and-navigation.md 参照）
  - 完了条件: Storybookで「通常(複数件)」ストーリーが表示される。propsは純プレゼンテーショナル（`{ programs: Array<{id,name,lastUsedAt,href}>, createHref }` 相当）
- [x] 2-1-2. 空状態ストーリーと表示
  - 説明: 0件時の構造的ヒント/サンプルコンテンツ提示（NOTE-3の扱いを本タスクで確定）
  - 完了条件: 空状態ストーリーが表示され、空状態の文言・サンプルコンテンツ方針がADR-023もしくは本タスクのコミットメッセージで記録されている
  - **NOTE-3の確定方針**: NOTE-3 の「初回はサンプルコンテンツで触って発見させる」はアプリ層の責務（サインアップ時のサンプルプログラム種付け等）とし、`react-components` はピュアプレゼンテーショナル層として「初回」と「空になった」を区別しない
  - **空状態の表現方針**: 専用の説明テキストブロックは置かず、リスト先頭に常に存在する `CreateProgramCard`（タスク 2-1-3）が「未入力スロット」として構造的ヒントを担う。空配列時はこのカードのみがリストに残り、`design-principles.md` の「データと構造で語る」「空になったら構造とラベルで導く」原則を満たす（ストーリー: `EmptyPrograms`）
- [x] 2-1-3. 新規作成リンクの配置 + ストーリー
  - 説明: 新規作成ボタン（FAB or ヘッダー）を `createHref` を使った Link として配置。プログラム作成への遷移リンクであり、Menuプリミティブは不要 (遷移先は当初 V14 想定だったが、設計判断 #53 で V14 撤廃に伴い V2 に変更。`CreateProgramCard` の `href` props は consumer 側で V2 の URL を渡す形になる)
  - 完了条件: 新規作成リンクが表示されるストーリーが存在
  - **配置の確定**: ドキュメントが例示する「FAB or ヘッダー」のいずれでもなく、`ProgramListItem` と同形のカード（`CreateProgramCard`）をリスト先頭に固定配置する形式を採用。理由:
    - `design-principles.md` の「発見の設計（教えるのではなく発見させる）」「リストビュー（カード形式）」「データと構造で語る」と整合
    - 「ここを押せばリストの先頭に追加される」を構造で示せる
    - 空状態の専用ブランチが不要になり、状態数が減る（normal と empty が同一構造）
  - **視覚表現**: `border-dashed` + `text-muted-fg` で「未入力スロット」を表現し、hover/focus で `border-solid` + `bg-secondary` + `text-fg` に昇格させて押下可能性を示す。`PlusIcon`（`@heroicons/react/24/solid`） + 「新しいプログラム」ラベル
- [x] 2-1-4. エラー状態ストーリー
  - 説明: 既存 ErrorAlert を差し込んだエラー状態
  - 完了条件: エラー状態ストーリーが表示
  - **実装方針の訂正**: `ErrorAlert`（demo由来で本来 primitive として整備されていない）には依存せず、`ProgramListError` を独立コンポーネントとして実装。`ProgramList` の `error?` props は撤去し、状態ごとにコンポーネントを分離（normal / loading / error）。アプリ側で表示切替（`if (error) return <ProgramListError />` 等）
  - **トーンの確定**: `design-principles.md` の「普段は寡黙に、必要なときだけ的確に伝える」に揃え、`bg-overlay + border-border + warning アイコン` の控えめな表現にする（`bg-danger/10` のような強い赤は避ける）。`ExclamationTriangleIcon` + 「プログラムを取得できませんでした」+ オプショナル詳細メッセージ
  - **共通シェル**: ヘッダー（`プログラム`）と `CreateProgramCard` は normal/error/loading で共通表示にし、状態遷移時の視覚的安定性を保つ。エラー時もデータ非依存の `CreateProgramCard` は表示し、V2 (新規作成) への導線を維持する (V14 撤廃: 設計判断 #53)。レイアウトは `<ul>` の最上段に `CreateProgramCard` を固定し、エラーバナーは `<ul>` の**下**に配置する（`CreateProgramCard` の縦位置をすべての状態で不変に保つことを優先）。`createHref: string` props を `ProgramListError` にも持たせる
  - **ページクロムの分離**: ヘッダー（「プログラム」見出し）と `<main>` ラッパーはビュー側に持たせず、consumer（apps/web）が `PageSection` + `PageHeading` プリミティブで組み立てる。理由は (1) ビューが見出しレベル（h1/h2）を固定できない、(2) `<main>`/`<section>` の選択はドキュメントアウトラインに依存する、(3) タイトル文言の所有権は consumer 側が自然。`PageHeading` は `as: "h1"|...|"h6"` を必須 props として受け取り、`PageSection` は `as: "main"|"section"`（デフォルト `"main"`）を取る
- [x] 2-1-5. ローディング状態ストーリー
  - 説明: `isLoading` props or 表示バリアントとして実装。skeleton-loading 活用を検討
  - 完了条件: ローディング状態ストーリーが表示
  - **実装方針**: `ProgramListLoading` を独立コンポーネントとして実装。`SkeletonLoading`（demo由来）には依存せず、`animate-pulse` + `bg-muted` で直接スケルトンを組み立てる
  - **スケルトン仕様**: `ProgramListItem` と同じカード形（`rounded-lg border border-border bg-overlay p-4`）でデータ到着時の視覚差分を最小化。固定4件
  - **アクセシビリティ**: `aria-busy` をリストに、`aria-live="polite"` の sr-only テキスト（「プログラムを読み込み中」）を外側に配置（`<ul>` 直下に非 `<li>` 要素を置かないため）
  - **CreateProgramCard の扱い**: ローディング中もリスト先頭に表示する。データに依存しないため隠す合理的な理由がなく、状態間の構造を一致させて状態遷移時の視覚的揺らぎを防ぐ（「発見の設計」: 位置の予測性）。`createHref: string` props を `ProgramListLoading` にも持たせる
- [x] 2-1-6. ページング戦略の確定 + 該当状態のストーリー
  - 説明: プログラム一覧のデータ増加速度・ページ位置保持・UX を踏まえて無限スクロール/Load More/ページネーション/分割不要から選ぶ。追加ロード中表示のストーリーを含める
  - 完了条件: 戦略が決定し、該当状態のストーリーが表示（分割不要なら省略可）
  - **確定方針**: **分割不要（全件表示）** を採用。理由:
    - 現状想定: ユーザー手動作成のみで数十件規模に収まるため、ページング機構は過剰
    - `CreateProgramCard` をリスト先頭に固定する設計（2-1-3）と「全件が視野に入る」前提が整合
    - 将来アプリ内エージェント機能でプログラム数が増える可能性はあるが、その時点では仮想化だけでなく「探す UI」（検索/フィルタ/並び替え）が必要になり、リスト UI の全面再設計フェーズに入るため、今ページング機構だけ前倒ししても投資効率が悪い
    - 単純な仮想化なら props を保ったまま内部差し替え可能（純プレゼンテーショナル層）
  - **ストーリー**: 分割不要のため追加ストーリーは省略
- [x] 2-1-7. レスポンシブ検証ストーリー
  - 説明: Viewportアドオンで 375px / 1280px 両方で崩れないことを確認。必要なら `md:` プレフィックスで列数切替
  - 完了条件: Viewport 切替時の表示が崩れない
  - **確定方針**: **レスポンシブグリッドを採用**（mobile 1列 / md 2列 / lg 3列）。NotebookLM 等のオブジェクト一覧 UI と同様、CreateProgramCard を (0,0) に配置するパターン
    - 一度「単一列維持」と決めかけたが、UI 設計論的に弱い論点（CreateCard 先頭セル意味論はグリッドと相性悪い → 反例多数 / カードが狭くなる → 列数次第で十分な幅 / 数十件規模だからグリッド不要 → 逆にグリッドの方が俯瞰しやすい）だったため撤回
    - グリッド採用の根拠: (1) Information scent: プログラムは「ユーザーの所有オブジェクト」感が強くカード/グリッド向き、(2) Responsive design 標準: モバイル1列・デスクトップ複数列が定石、(3) `max-w-2xl` でデスクトップ空間を狭くするのはフォーム/記事向けの選択でカード一覧には不適
  - **`PageSection` の拡張**: `width: "narrow" | "wide"` prop を追加（デフォルト `"narrow"` = `max-w-2xl`、`"wide"` = `max-w-screen-xl`）。フォーム系ビューは `narrow`、カード一覧系ビューは `wide` を選択する
  - **エラー状態のレイアウト**: グリッド構造を維持し、エラーバナーは `lg:col-span-2` で `CreateProgramCard` と同じ行に配置（mobile=縦並び / md=同サイズ横並び / lg=`[CreateCard 1セル][ErrorBanner 2セル]`）。CreateCard を (0,0) に固定し、空セルや別行配置による「リズムのズレ」を排除。`align-items: stretch` でセル高さが揃い、CreateCard は `min-h-20` + `flex items-center` で内容が中央に維持される
  - **カードの区切り表現**: 当初は `ProgramListItem` / `ErrorBanner` / スケルトンに `border border-border` を付けていたが、`bg-overlay` と `bg`（ページ背景）が同じ純白で `bg-overlay` だけでは区切りにならないため、border は必要悪だった。各要素の役割に応じて表現を分ける方針に変更:
    - `ProgramListItem`: `shadow-sm` + hover `shadow-md`（押せる実体カードの「持ち上がり」感）
    - `CreateProgramCard`: dashed border のみ（未入力スロット記号、実体ではないので shadow なし）
    - `ErrorBanner`: 装飾なし（`flex items-start gap-3 p-4` のみ。アイコン + テキストの「メッセージ」表示）。`bg` も `shadow` も `border` も持たない。理由: (1) 静的メッセージなのに shadow を付けると「押せる」とミスリードする、(2) `bg-overlay` も page bg と同色で意味を持たない、(3) メッセージなしの場合 CreateCard と高さがズレるが、輪郭がないので視覚的に目立たない
    - スケルトン: `shadow-sm`（後でデータカードが入る位置のため、データカードと同じ質感）
  - 結果として「押せる実体 = shadow / 未入力スロット = dashed / メッセージ = 装飾なし」の3層が質感で識別される
  - **ストーリー追加**: `program-list.stories.tsx` / `program-list-loading.stories.tsx` / `program-list-error.stories.tsx` 各々に `Mobile`（375px ピン留め）と `Desktop`（1280px ピン留め）を追加。Flow ストーリーも `width="wide"` に変更
  - **保留**: NotebookLM 風の Day 名サマリー表示（カード密度を上げる施策）は本タスクでは入れない。アドホックワークアウトで Day 構造を持たないプログラムの扱いが未確定なため、別タスクとして後送り

##### 2-2. ~~V14 プログラム作成~~ (撤廃: 設計判断 #53) → 2-6 で V16 として復活 (設計判断 #54)

V14 (プログラム作成) は設計判断 #53 で撤廃し、プログラム新規作成 (UC_A_1) を V2 のインライン編集に統合する方針だった。しかし設計判断 #54 で再判断し、複数フィールド (プログラム名 + 詳細) と将来の AI 生成連携を見越して新「プログラム新規作成」(V16) を独立フォームとして導入する方向に変更（旧 V14 とは別物）。本セクションのうち 2-2-1 (TextField プリミティブ) は完了済で、V16 / V17 のフォーム入力や種目詳細のインライン編集で引き続き利用する。実装タスク群は 2-6 (V16) と 2-7 (V17) を参照。

- [x] 2-2-1. TextField プリミティブを追加
  - 説明: `pnpm ui:fetch @intentui/text-field` で取得後、意見を剥がして `src/primitives/text-field.tsx` に配置
  - 完了条件: TextField が単体でストーリー化されている
  - **実装方針**: CLAUDE.md のフォルダコロケーション規約に合わせ `src/primitives/text-field/text-field.tsx` に配置。Intent UI の text-field は最小ラッパーだけで Input を含まないため、`TextField` / `TextFieldLabel` / `TextFieldInput` / `TextFieldDescription` / `TextFieldError` を modal パターンに倣って同ファイル内に co-locate。`Label` `Input` などの汎用名は将来 NumberField 追加時（2-4-1）に共有プリミティブ昇格を検討する
  - **意見の剥がし**: アロー関数 + `FC` 型注釈に書き換え、import パス（`@/lib/primitive` → `../../libs/primitive`）を修正。className ヘルパーは react-aria-components 側の型に応じて使い分け（Label / Description は className が `string` only なので `cn`、TextField / Input / FieldError は render-prop 対応なので `cx`）。アクセシビリティ実用品の `select-none` `forced-colors:text-[Mark]` は維持
  - **V14 撤廃後の用途**: V2 のプログラム名インライン編集 (2-3-4)、Day ラベル編集 (2-4-6)、種目名編集 (4-2-3) などで引き続き利用
- [ ] ~~2-2-2. V14 フォーム骨格 + 通常状態ストーリー~~ (撤廃: 設計判断 #53)
  - ~~説明: プログラム名入力 + 送信ボタン + キャンセルボタン~~
  - ~~完了条件: 通常状態ストーリーが表示。propsは `{ onSubmit, onCancel }` 相当~~
- [ ] ~~2-2-3. バリデーション/送信中/送信失敗状態のストーリー~~ (撤廃: 設計判断 #53)
  - ~~説明: 空文字・文字数制限・送信中・失敗各状態（送信中=ローディング相当として本タスクに統合）~~
  - ~~完了条件: 4状態のストーリーが表示~~

##### 2-3. V2 プログラム詳細

- [x] 2-3-1. Tabs プリミティブを追加
  - 説明: `pnpm ui:fetch @intentui/tabs` で取得、意見を剥がして `src/primitives/tabs.tsx` に配置
  - 完了条件: Tabs が単体でストーリー化されている
  - **実装方針**: CLAUDE.md のフォルダコロケーション規約に合わせ `src/primitives/tabs/tabs.tsx` に配置。公開 API は `Tabs` / `TabList` / `Tab` / `TabPanel` の最小構成。`TabPanels` (collection ベースの宣言的パターン) は現状の利用ケース (V2 Day タブ・V3 Day 切替) に不要なため取り込まず YAGNI
  - **意見の剥がし**: Intent UI テンプレが提供する `SelectionIndicator` (アニメーション付き選択インジケーター) と `TabListContext` を撤去し、`selected:` 状態で `::after` 疑似要素のシンプルな下線/側線に置き換え。`design-principles.md` の「アニメーション控えめ」方針と整合
  - **TabScrollArea**: 当初は YAGNI で除外したが、2-3-2 の V2 Day タブをモバイル幅 (375px) で確認したところ Day ラベルがビューポートを超えてはみ出すケースが発覚したため、後追いで追加 (PR #709)。`overflow-x-auto` + scrollbar 非表示の薄いラッパーで、`<TabScrollArea><TabList>…</TabList></TabScrollArea>` の形で利用する
  - **orientation 対応**: `tailwindcss-react-aria-components` プラグインの `orientation-horizontal:` / `orientation-vertical:` 変種を使い、horizontal は下方向の border + 下線、vertical は左方向の border + 側線で表現。両 orientation に対応
  - **import パス補正**: テンプレ内の `react-aria-components/Tabs` などサブパス import を top-level `react-aria-components` に統一 (既存プリミティブと一致)。テンプレの `cx` 出自 `@next-lift/lib/primitive` (実在しない) を `../../libs/primitive` に修正
- [x] 2-3-2. V2 骨格 + Day一覧 + 通常状態ストーリー
  - 説明: プログラム名 + メタ情報 + Dayタブの骨格
  - 完了条件: 通常状態（Day複数件）ストーリーが表示
  - **実装方針**: `src/views/program-detail/program-detail.tsx` に `ProgramDetail` を配置。views-and-navigation.md L171「プログラム → Day = 概要一覧（タブ/横スクロール）」に従い、Day 一覧は 2-3-1 で導入した Tabs プリミティブで表現。Day 一覧部分は当初 `DayTabList` として別ファイルにコロケーションしていたが、ProgramDetail からしか使われず単純な map 処理だったためインライン化
  - **props 形 (純プレゼンテーショナル)**: `{ name: string; meta: string | null; days: Day[]; defaultSelectedDayId?: string }`、`Day = { id, label, detailHref }`。controlled モード（`selectedDayId` / `onSelectedDayIdChange`）は当面 YAGNI。URL 連動が必要になった時点で追加する
  - **見出し**: プログラム名を `<h1>` でビュー内部に描画。CLAUDE.md「ビューはページクロムを持たない」原則は PR #707 で見出しレベル関連の記述を削除済 (V15 のインライン埋め込み形式が確定するまで全ビューに課す必要は低いとの判断)。詳細系ビューはオブジェクト名そのものがページの主見出しになるため、ビュー内に内包する方が自然
  - **新規作成直後の状態 (name 空)**: V1 → V2 直接遷移直後で name が空の場合は、V2 を表示せずアプリ層がフォームモードを出すか、V2 内で別バリアントとして扱う想定 (2-3-4 で確定)。骨格段階の本タスクでは「name は常に存在する文字列」を前提とし、空 name の専用ストーリーは作らない
  - **モバイルでのタブはみ出し対応**: TabList を `TabScrollArea` (PR #709 で追加) で包み、`overflow-x-auto` で横スクロール可能にする。scrollbar は非表示。views-and-navigation.md L171「タブ/横スクロール」と整合
  - **Day タブのパネル内容**: 骨格段階では各 TabPanel を空にする。Day の中身 (種目計画リスト等) は別タスク (V3 統合) で実装予定。空である事情はソース上に 1 行コメントで明示し、後続作業時の意図確認をスムーズにする
  - **ストーリー**: `MultipleDays` (Day 4 件 + メタあり) / `NoMeta` (メタ null) / `LongProgramName` (name の長文ラップ確認) / `Mobile` (375px ピン留め、TabScrollArea の動作確認) / `Desktop` (1280px ピン留め) の 5 本。decorator は `PageSection width="wide"` のみで、ビュー本体に `<h1>` を持つため consumer 側のページタイトル組み立ては不要
- [x] 2-3-3. Day未作成の空状態ストーリー
  - 説明: Day 0件時の表示とDay追加への誘導
  - 完了条件: 空状態ストーリーが表示
  - **想定シナリオの確定 (設計判断 #54, #55, #58 を踏まえた整理)**: 本タスクで実装した Day 0件UI (`CreateDayCard`) は **全 Day 削除後のエッジケース** のみを想定する。新規作成直後は V16 プログラム新規作成 → V17 Day新規作成 → V2 プログラム詳細 のフロー (設計判断 #54, #55) を経るため、V2 に到達した時点で必ず Day が 1 件以上存在する。アプリ層 (apps/web) は新規作成時に `Program + Day×1 + 種目計画×1(種目未確定) + セット計画×1(値未入力 = paramsなし)` を初期生成して V17 に渡す責務を持つ (設計判断 #58)。データ構造側の対応は erd-design 設計判断 #32 (`set_plans → params` を `\|\|--o\|` に緩める) を参照
  - **構造の確定**: `ProgramDetail` 本体内で `days.length === 0` 分岐を持つ (`ProgramDetailEmpty` 等の独立コンポーネントには分離しない)。理由: ヘッダー (プログラム名・メタ) は normal/empty で共通であり、Tabs ブロックだけが「未作成プレースホルダー」に置き換わる構造。V1 で error/loading を独立コンポーネント化したのは構造ごと別物だったためで、Day 0件は normal の自然な末端形態という違いがある (`design-principles.md` 「空になったら構造とラベルで導く」と整合)
  - **CTA 配線の前倒し**: `onAddDay: () => void` props を本タスクで導入し、空状態 CTA を初出時点から機能させる。理由: V1 で `CreateProgramCard` が 2-1-2 (空状態タスク) 時点から機能する `href` を持っていた前例と整合。2-3-5 (Day追加アクションの配線) は本タスクと役割分担を明確化し、normal 状態 (Day 1件以上) での Day追加ボタン位置・追加直後のフォーカス先・追加完了時の視覚フィードバックの確定に集中する
  - **視覚表現**: `CreateDayCard` を `program-detail/` 配下にコロケーション (V1 の `CreateProgramCard` と同型)。`PlusIcon` + 「Day を追加」ラベル + dashed border + hover/focus で `border-solid` + `bg-secondary` に昇格。Tabs ブロックの代わりに 1 枚の単体カードを描画する (Day 0件で TabList も無いため)。`views-and-navigation.md` L133「ビュー内のアクションボタン」配置と整合
  - **ストーリー追加**: `NoDays` (デフォルト幅) / `NoDaysMobile` (375px ピン留め) / `NoDaysDesktop` (1280px ピン留め) の 3 本。`onAddDay` は Storybook の `fn()` でモック

**注**: 2-3-4〜2-3-22 は 2026-05-02 に旧 2-4 (V3 Day 詳細、設計判断 #56 で V2 に統合) を取り込んで再分解した結果。設計判断 #58 によりアプリ層が `Day×1 + 種目計画×1 + セット計画×1` の初期構造を渡す前提のため、V2 通常状態は常に Day パネル中身が存在する（**ただし設計判断 #61 で「初期構造はアプリ層が V17 内部で作って V17 のフォームに渡す。V17 → V2 遷移時には valid な完全データになっている」と再整理**。V2 自体は保存済みデータの表示専用）。インライン編集パターンは SetPlanRow (2-3-10) で確立し、Day ラベル (2-3-14) / プログラム名 (2-3-15) / V13 種目名で流用する。

###### プリミティブ整備 (先行)

- [x] 2-3-4. NumberField プリミティブを追加
  - 説明: `pnpm ui:fetch @intentui/number-field` で取得後、意見を剥がして `src/primitives/number-field/number-field.tsx` に配置（ADR-024 に従う）。SetPlanRow の重量・回数入力、微調整ステッパー (設計判断 #59-E) で利用
  - 完了条件: NumberField が単体でストーリー化されている。`step` / `formatOptions` (kg / lbs / 回) のバリエーションを確認できる
  - **実装方針**: TextField (2-2-1) と同じ構造に揃え、`NumberField` / `NumberFieldLabel` / `NumberFieldInput` / `NumberFieldDescription` / `NumberFieldError` の 5 公開 API を `src/primitives/number-field/number-field.tsx` に co-locate
  - **意見の剥がし**: Intent UI テンプレの `Input` / `InputGroup`（複雑な `[data-slot=text/keyboard/...]` 群、`--input-gutter-*` カスタムプロパティ、共有 `field.tsx` への分割）は採用せず、TextField の最小ラッパー方針に揃える。`Group` を直接使いステッパーをインライン配置（`[ - | input | + ]`）。理由: (1) TextField の `TextFieldInput` と対称、(2) 共有 `field.tsx`/`input.tsx` ファイルは現時点で他プリミティブから使われない、(3) 数値入力に対称な ± 配置は touch-friendly でモバイル前提の設計と整合
  - **アイコン**: `MinusIcon` / `PlusIcon` を `@heroicons/react/24/solid` から取得（既存 `CreateProgramCard` と同じパス。テンプレ既定の `20/solid` ではなく統一）
  - **invalid / disabled の伝播**: `Group` は `<div>` のため `:invalid` / `:disabled` 擬似クラスが効かず、React Aria が付与する `data-[invalid]` / `data-[disabled]` を使用（TextField の `<input>` は HTML 擬似クラスで足りる点が異なる）
  - **import パス補正**: テンプレ内の `react-aria-components/NumberField` 等のサブパス import を top-level `react-aria-components` に統一（既存プリミティブと一致）。テンプレの `cx` 出自 `@next-lift/lib/primitive` (実在しない) を `../../libs/primitive` に修正
  - **ストーリー**: 数値入力の各バリエーション (Default / WithDescription / WeightKg (step=2.5, kg unit) / WeightLbs (step=5, lbs unit) / Reps (step=1) / WithMinMax / Required / Invalid / Disabled / ReadOnly / Empty (placeholder)) の 11 本を `number-field.stories.tsx` に追加
- [x] 2-3-5. Menu / MenuTrigger プリミティブを追加
  - 説明: `pnpm ui:fetch @intentui/menu` で取得後、意見を剥がして `src/primitives/menu/menu.tsx` に配置（ADR-024 に従う）。プログラム複製/削除、Day 削除、種目計画削除、セット計画削除、ワークアウト履歴削除、種目削除、1RM 削除で利用
  - 完了条件: Menu / MenuTrigger が単体でストーリー化されている
  - **実装方針**: 公開 API は `MenuTrigger` / `Menu` / `MenuItem` / `MenuSeparator` の最小 4 つに絞る。`MenuTrigger` は `MenuTriggerPrimitive` をそのまま再エクスポート（context provider）。`Menu` は `Popover` + `MenuPrimitive` を 1 コンポーネントに合成（呼び出し側のネストを 1 段減らす）
  - **意見の剥がし**: Intent UI テンプレが提供する Section / SubmenuTrigger / Header / Keyboard shortcut / DropdownLabel / DropdownDescription / 選択チェックインジケーター / Avatar 対応は YAGNI で除外。共有 `dropdown.tsx` への分割もしない（ListBox との共有は ComboBox 実装時に再判断）。MenuItem の variant は `intent: "danger"` のみ（warning は現状利用ケースなし）
  - **placement / offset の透過**: `Menu` props に `placement` / `offset` を `Pick<PopoverProps, ...>` で透過。`exactOptionalPropertyTypes` 有効のため `placement` は `undefined` のときに渡さないよう条件展開
  - **ストーリー**: 計 6 本（Default / WithSeparator / ProgramContextMenu (アイコン付き) / DangerOnly / DisabledItem / PlacementBottomEnd）
- [x] 2-3-6. ComboBox プリミティブを追加
  - 説明: `pnpm ui:fetch @intentui/combo-box` で取得後、意見を剥がして `src/primitives/combo-box/combo-box.tsx` に配置（ADR-024 に従う）。設計判断 #57 で V4 撤廃に伴い、種目選択用に新設。広画面=Popover、狭画面=Drawer の使い分けは内部または別プリミティブで対応 (実装時に判断)
  - 完了条件: ComboBox が単体でストーリー化されている。検索フィルター・選択・空状態のストーリーが揃う
  - **実装方針**: 公開 API は `ComboBox` / `ComboBoxLabel` / `ComboBoxInput` / `ComboBoxList` / `ComboBoxItem` / `ComboBoxDescription` / `ComboBoxError` の 7 つ。TextField / NumberField と同じ field/label/input/description/error 構成に揃え、popup 部分のみ `ComboBoxList` (= `Popover` + `ListBox`) で受け取る
  - **広画面/狭画面の切り替え**: 別 primitive として Drawer (2-3-6.5) を追加。画面幅で Popover ↔ Drawer を切り替える責務は view 層に置き、primitive は意見を持たない
  - **意見の剥がし**: Intent UI テンプレが提供する Section / DropdownLabel / DropdownDescription / 選択チェックインジケーター / Avatar 対応は YAGNI で除外。共有 `dropdown.tsx` への分割もしない（Menu と ComboBox で別々に最小実装。共通化は 3 つ目のドロップダウン系利用ケースが出た時点で再判断）
  - **空状態の扱い**: `ListBox` の `renderEmptyState` に任せる方針（独自 `ComboBoxEmpty` は作らない）。検索結果なし・登録 0 件のいずれも consumer 側でメッセージを差し込める
  - **Group + chevron 構造**: NumberField のステッパーと同様、`Group` で `Input` + chevron `Button` をラップ。chevron は `ChevronUpDownIcon`（24/solid、既存パターンに統一）
  - **ストーリー**: 計 9 本（Default / WithDescription / WithDefaultSelection / Empty (登録 0 件) / NoMatches (検索結果なし) / Required / Invalid / Disabled / CreateNewOption (未登録項目をその場で登録、play 関数で動作検証あり)）
- [x] 2-3-6.5. Drawer プリミティブを追加
  - 説明: 狭画面で種目選択や設定パネル等を表示するための Drawer (sheet) を追加。`@intentui/sheet` を起点に意見を剥がして `src/primitives/drawer/drawer.tsx` に配置（ADR-024 に従う）。`Drawer` (= `DialogTriggerPrimitive`) / `DrawerTrigger` / `DrawerContent` (`placement: "bottom" | "top" | "left" | "right"`) / `DrawerTitle` / `DrawerClose` の 5 公開 API
  - 完了条件: Drawer が単体でストーリー化されており、4 placement と dismissable / closeButton 制御が確認できる
  - **責務分離**: ComboBox とは別 primitive。画面幅で Popover ↔ Drawer を切り替えるのは view 層 (例: 種目選択ビュー) の責務とし、primitive は意見を持たない

###### V2 Day パネル中身の骨格と通常表示

- [x] 2-3-7. V2 Day パネル骨格 (ExercisePlanSection 配置)
  - 説明: 各 Day タブパネルに種目計画セクションを描画。props 構造 (Day → ExercisePlan[] → SetPlan[]) を設計
  - 完了条件: 通常状態ストーリー（Day 1件以上、各 Day に種目計画 1件以上）が表示
  - **props 型の確定 (Day → ExercisePlan[] → SetPlan[])**:
    - `Day` に `exercisePlans: ExercisePlan[]` を追加（既存 `id`/`label`/`detailHref` に追加）
    - `ExercisePlan = { id, exercise: { id, name, weightUnit: "kg" | "lbs" } | null, setPlans: SetPlan[] }`。`exercise: null` は種目未選択（設計判断 #57/#58）
    - `SetPlan = { id, params: SetPlanParams | null }`。`params: null` は値未入力（設計判断 #58）
    - `SetPlanParams` は判別共用体: `{ pattern: "weight-reps"; weight; reps }` / `{ pattern: "weight-rpe"; weight; rpe }` / `{ pattern: "reps-rpe"; reps; rpe }`（設計判断 #59-A）
    - 重量単位 (`weightUnit`) は ExercisePlan に紐づく（ADR-027 由来。SetPlanRow 表示時に `${weight}${unit}` で利用）
  - **コンポーネント分割**: `program-detail/` 配下に `exercise-plan-section.tsx` / `exercise-plan-row.tsx` / `set-plan-row.tsx` をコロケーション。`ExercisePlanSection` は `<ol>` で `ExercisePlanRow` を並べ、`ExercisePlanRow` は種目ヘッダー + `<ol>` の `SetPlanRow` を並べる
  - **2-3-8 / 2-3-9 の先取り範囲**: ストーリーで「Day に種目計画 1件以上」を表示できる最小限として通常表示のみ実装
    - 2-3-8 (ExercisePlanRow): **種目選択済み**ケースのみ実装。種目未選択時は ComboBox ではなくテキストプレースホルダ「種目を選択」を表示（ComboBox 統合は 2-3-8 本タスクで対応）
    - 2-3-9 (SetPlanRow): 3 パターン + `params: null`（「値未入力」と表示）の通常表示のみ実装。鉛筆アイコンや微調整ステッパーは 2-3-10 で追加
  - **ストーリー追加**: `MultipleDays` / `NoMeta` / `LongProgramName` / `Mobile` / `Desktop` の既存サンプルに `exercisePlans` を追加（3 パターンのセット計画を含む）。新規 `InitialStateAfterCreation` で「V16 → V17 → V2 直後」の状態（Day×1 + 種目計画×1（種目未選択）+ セット計画×1（params: null））を表示
- [x] 2-3-8. ExercisePlanRow 通常表示
  - 説明: 種目名 + セット計画リスト表示。種目未選択時は ComboBox 表示 (設計判断 #57)
  - 完了条件: 種目確定済み / 種目未選択（ComboBox 表示）の両ストーリーが表示
  - **2-3-7 で先取り済みの範囲**: 種目選択済みケースの通常表示。本タスクで残るのは種目未選択時の ComboBox 統合（広画面=Popover、狭画面=Drawer の view 層責務での切替を含む）
  - **2026-05-05 に方針を更新**: ExercisePlanRow に「`exercise === null` で picker auto-show」する統合は **2-3-12 種目計画追加へ統合** することにし、本タスクからは外した。理由:
    - プログラム詳細の通常閲覧では `exercise === null` は実質発生しない（設計判断 #61）
    - 種目選択 picker の起動はユーザーの能動操作（インライン編集または「種目計画追加」）で行うほうが、他のインライン編集タスク (2-3-10 / 2-3-14 / 2-3-15) と整合する
    - その結果、`exercise === null` 行は当面プログラム詳細では「種目を選択」プレースホルダ表示のまま (2-3-7 の状態)。picker は 2-3-12 で能動的に起動する形で導入する
  - **本タスクで実装したもの**:
    - `program-detail/exercise-selector.tsx`: 広画面=ComboBox（Popover）、狭画面=Drawer の picker。`onSelect` / `onCreateExercise` props を持ち、controlled inputValue + 手動 items 計算で「一致する種目がありません」+「`{query}` を追加」を共存表示する（React Aria ComboBox は items 0 件で popover を閉じてしまうため、placeholder item を必ず注入する）。Drawer は `h-[80dvh]` 固定で検索結果による高さブレを排除
    - `program-detail/exercise-selector.stories.tsx`: 広画面 / 狭画面 / 0 件 / 新規追加可 / インタラクティブ動作の各ストーリー
    - ComboBox primitive (`primitives/combo-box/combo-box.tsx`) の `ComboBoxList` の Popover に `max-h-72 overflow-hidden` を追加（ListBox の overflow が Popover panel から漏れるバグ修正）
  - **本タスクで実装しなかったもの (2-3-12 へ送り)**:
    - ExercisePlanRow から ExerciseSelector を呼び出す統合
    - ProgramDetail / ExercisePlanSection への `availableExercises` / `onSelectExercise` props 受け渡し
  - **2026-05-05 追加レビュー指摘 → 別ファイルに breakdown して `/tdd` 想定**: ExerciseSelector 自体に 6 件の改善が必要（選択中表示、選択中ハイライト、create option 常時表示、重複登録防止、文言、play test 整備）。詳細は `docs/development/2026-05-05-exercise-selector-refinement/breakdown.md` を参照。本タスク 2-3-8 のチェックは維持（picker UI が「成立」していることが完了条件のため）、洗練は別 breakdown で進行する形にした
  - **設計判断 #61 (2026-05-05)**: V2 プログラム詳細は保存済みデータのみ表示する。新規作成フロー直後は V17 Day新規作成 のフォーム画面を経由し、V2 到達時点で全フィールドが充足済みになる。`exercise === null` / Day 0 件は (a) 種目計画追加 (2-3-12) 直後の transient state、(b) 全削除後のエッジケース、のみで発生する。これにより、`InitialStateAfterCreation` という名のストーリーは設計上ありえない状態を表示しているため、後続作業 (`exercise-selector-refinement` または 2-3-12) で削除またはリネーム予定
- [x] 2-3-9. SetPlanRow 通常表示
  - 説明: 重量・回数・パターン (設計判断 #59-A) の表示。編集機能なし
  - 完了条件: 通常状態 / 値未入力（params なし、設計判断 #58）のストーリーが表示
  - **2-3-7 で先取り済みの範囲**: 3 パターン + `params: null` の通常表示と書式（`${weight}${unit} × ${reps}回` / `${weight}${unit} @ RPE ${rpe}` / `${reps}回 @ RPE ${rpe}` / `値未入力`）。本タスクで残るのは SetPlanRow 単独のストーリー化（program-detail.stories.tsx で間接的に表示中だが、SetPlanRow 単独のバリエーションストーリーは未作成）
  - **実装内容**: SetPlanRow を `set-plan-section.tsx` から `set-plan-row.tsx` に切り出して export（「1ファイル1export」「ファイル名と export 名揃える」原則に整合）。`SetPlanSection` の `Params` 型は `ComponentProps<typeof SetPlanRow>["params"]` から派生（react.md「公開 API は ComponentProps で派生」と整合）。`set-plan-row.stories.tsx` を新規作成し、3 パターン（WeightXReps / WeightXRpe / RepsXRpe）+ Empty（params: null）+ WeightXRepsLbs（lbs 単位）+ HigherIndex（連番表示）の 6 ストーリーを追加
  - **2026-05-11 設計判断 #63 で事後再構成**: 単一の `SetPlanRow` を kind 別の独立コンポーネントに分割（`SetPlanRowWeightXReps` / `SetPlanRowWeightXRpe` / `SetPlanRowRepsXRpe` / `SetPlanRowEmpty`）。共通の表示枠は internal `SetPlanRowFrame` に切り出し。SetPlanSection は `pattern.kind` で switch して呼び分ける。表示書式自体は変更なし

###### インライン編集パターン確立 (テンプレートタスク)

- [x] 2-3-10. SetPlanRow のインライン数値編集 + パターン切替 + 微調整ステッパー
  - 説明: NumberField で値編集。パターン切替 (セット単位、設計判断 #59-A)、パターン切替時の値全クリア (設計判断 #59-B)、微調整ステッパー `-2.5kg/+2.5kg/-1回/+1回` (設計判断 #59-E、刻み量は種目スキーマから受け取る)。`exercises` への `weightStep`/`repsStep` 追加は別 Issue
  - 完了条件: 鉛筆アイコンタップで開始 → 編集 → Enter / チェックアイコンで確定 / Escape でキャンセル / blur は何もしない (設計判断 #60)。各操作のストーリーが揃う
  - **本タスクでの確定が以降のインライン編集タスク (Day ラベル 2-3-14、プログラム名 2-3-15、V13 種目名など) のテンプレートになる**
  - **2026-05-11 設計判断 #62 で事後撤回**: 編集UIからパターン切替を撤去（パターン変更はセット削除→追加へ）。本タスクで実装したパターン切替メニュー UI および対応ストーリー (`DesktopEditingPatternSwitchClearsValues` / `MobileEditingPatternSwitch`) は削除済み。設計判断 #59-B (パターン切替時の値全クリア) は本判断で moot。SetPlan 単位でパターンを保持する #59-A の構造、および NumberField 編集 + 微調整ステッパーの実装はそのまま維持
  - **2026-05-11 設計判断 #63 で事後再構成**: 単一の `SetPlanRow` (kind 内部分岐) を kind 別の独立コンポーネントに分割（公開: `SetPlanRowWeightXReps` / `SetPlanRowWeightXRpe` / `SetPlanRowRepsXRpe` / `SetPlanRowEmpty`、internal: kind 別の `SetPlanEditForm*`、共通の `SetPlanRowFrame` / `SetPlanRowEditTrigger` / `SetPlanRowPopover` / `SetPlanRowDrawer`）。SetPlanSection が `pattern.kind` で 1 度だけ switch して呼び分ける。各 Row の Props は kind を含まない個別フィールドと kind を含まない `onChange` ペイロード。Empty (params なし) は表示のみで編集ボタンなし。ストーリーも kind/Empty 別に 4 ファイルに分割し、共通の play test helper は `stories-test-utils.ts` に切り出し

###### 追加・削除アクション類

- [x] 2-3-11. セット計画の追加・削除 + ストーリー
  - 説明: セット追加時の直前セット継承 (値+パターン、設計判断 #59-C)。設計判断 #62 により、編集UIからパターン切替が撤去されたため、別パターンで追加したい場合は追加 UI 側でパターンを選択する手段を提供する（既定は直前セットのパターン継承）。削除は Menu (2-3-5) 経由
  - 完了条件: 追加（既定のパターン継承 / 別パターン指定）・削除のストーリーが表示
  - 実装メモ: SetPlanSection に `onAddSetPlan` / `onDeleteSetPlan` を追加。継承ロジックは Section 内に集約（最後の SetPlan の pattern/値を新規ペイロードにコピー）。setPlans が空のときは weight-x-reps + 0/0 を既定として追加。別パターン指定は SetPlanAddTrigger の Split UI（メインボタン = 直前継承、▼ メニューで kind 指定）。各 Row には共通の SetPlanRowActionMenu を SetPlanRowFrame の `menu` slot に配置（Empty 行にも削除メニューあり）
- [x] 2-3-12. 種目計画の追加・削除 + ストーリー
  - 説明: 種目計画追加時の初期構造リセット (設計判断 #59-D)。削除は Menu (2-3-5) 経由。種目ゼロ・セットゼロは「途中で削除した」エッジケースとして本タスク内で扱う
  - 完了条件: 追加・削除のストーリー、エッジケース（種目ゼロ・セットゼロ）のストーリーが表示
  - **2-3-8 から引き継ぐ範囲 (2026-05-05)**: ExercisePlanRow から ExerciseSelector (2-3-8 で実装済み) を呼び出す統合と、ProgramDetail / ExercisePlanSection への `availableExercises` / `onSelectExercise` (および `onCreateExercise`) props 受け渡しを本タスクで実装する。「追加」アクション直後の動作（追加された行の picker を即フォーカス展開するか、明示クリック前提か）も本タスクで確定する
  - **進捗 (2026-05-20)**: 追加・削除 API と ExercisePlanSection / ProgramDetail への伝搬、`CreateExercisePlanCard` の新設、種目計画ゼロ件の空状態、追加/削除の play test ストーリーは実装完了 (設計判断 #71)。設計判断 #59-D「種目計画追加時の初期構造リセット」は設計判断 #68 で Empty 行廃止により `setPlans: []` に単純化（consumer 責務、設計判断 #71）。Issue #776 の「種目計画追加直後の transient state」は #68 + #70 で構造的に解消済み
  - **設計判断 #71 更新 (2026-05-20)**: 当初は削除を Menu (`EllipsisVerticalIcon` + Menu「種目計画を削除」) 経由としていたが、項目 1 個のメニューを開く操作が冗長なため、SetPlanRow と同じく直接 `TrashIcon` ボタンに変更。誤タップによる削除リスクは別 breakdown (undo/redo) で取り消し可能性を担保する前提
  - **設計判断 #71 再更新 (2026-05-20)**: 直接 `TrashIcon` 案は実機確認で「種目計画ヘッダーの TrashIcon と直下のセット計画行の TrashIcon が縦に並んで視認性が落ちる（カード内でゴミ箱2個が並ぶ）」問題が判明。最終形は `XMarkIcon`（`@heroicons/react/24/solid`）をカード（`Section`）の右上角に `absolute top-2 right-2` で独立配置。ヘッダーは `pr-8 pl-1` で重なり回避。「親階層 = カードを × で閉じる」「葉階層 = 行を 🗑 で捨てる」のアイコン語彙差で識別し、操作モデル（直接1タップ削除）の一貫性は維持
  - **完了 (2026-05-20, ExerciseSelector 統合)**: `ExercisePlanSection` に `availableExercises` / `onSelectExercise(exercisePlanId, exerciseId)` / `onCreateExercise(exercisePlanId, name)` の 3 props を追加し、`exercise === null` の行で `ExerciseSelector` を描画。`ProgramDetail` から同 props を伝搬。ヘッダーは `flex items-baseline` を撤去し picker の input/button が破綻しないレイアウトに調整
  - **picker フォーカス展開の挙動確定 (2026-05-20)**: 追加直後の自動展開はしない（明示クリック起動）。理由: (1) SetPlanRow の編集パターン（鉛筆アイコンで明示起動）と一貫、(2) 連続追加時にモバイルで Drawer が自動展開すると混乱、(3) `exercise === null` 行に picker は常時可視のため発見性は十分。Story `SelectExerciseAfterAdding` で「追加 → picker クリック → 種目選択 → onSelectExercise 発火」の統合フローを play test で検証
  - **追加フロー再設計 (2026-05-20, 後追い改定)**: 「追加 → 空カード（picker のみ）→ クリック → 種目選択」の 2 段クリックを是正するため、**picker そのものを add トリガに昇格**させる方針に変更。`CreateExercisePlanCard`（plain ボタン）を撤去し、`ExerciseSelector` をリスト末尾に直接配置。種目選択 → 直接 `exercise` 充填済みの種目計画が新規追加される。
    - **`exercise: null` を型から撤去**: transient state 自体が構造的に消えるため。Exercise マスタが削除された場合の orphan ケースは「種目計画を cascade 削除（削除時に影響を受ける種目計画一覧で警告）」とする方針（別 issue で実装）
    - **API 変更**: `ExercisePlanSection.onAddExercisePlan: () => void` + `onSelectExercise(planId, exerciseId)` + `onCreateExercise(planId, name)` を、`onAddExercisePlanWithSelectedExercise(exerciseId)` + `onAddExercisePlanWithNewExercise(name)` の 2 つに置き換え。`ProgramDetail` 側も同じ形で受けて apps/web に伝搬する shape に変更
    - **種目の再選択は不可**（最初の選択のみ）: 変更したい場合は種目計画を削除 → 追加し直す。理由: (a) 操作モデルがシンプル、(b) 種目変更は weightUnit/weightStep が異なる可能性があるため全 setPlan を破棄することになり confirm を出すくらいなら削除→追加のほうが素直、(c) 誤削除は別 breakdown の undo/redo で取り消し可能性を担保する前提
    - **picker auto-focus はしない**: 「種目を選択」placeholder で十分発見可能。auto-focus は押し付けがましく、触って学べる UX を阻害する
    - **Story 更新**: `AfterAddingExercisePlan`（exercise: null 表示）と `SelectExerciseAfterAdding`（2 段フロー）を削除し、新規 `AddExercisePlanBySelectingExercise`（picker → 既存種目選択 → callback 発火）に置き換え。stateful wrapper も `handleAddExercisePlanWith{Selected,New}Exercise` ベースに再構成
    - **ADR は起こさない**: アーキテクチャ判断ではなく UX 判断のため、本 breakdown 追記のみで完結
  - **picker 視覚設計とフロー連続性の調整 (2026-05-21)**: 初稿の `ExercisePlanPickerCard`（`createAffordanceClass` の破線枠で `ExerciseSelector` を包む）を撤去し、`ExerciseSelector` をリスト末尾に**枠なし・ラベルなしで直接配置**。リスト末尾の位置 + placeholder「種目を選択」+ 下矢印で意図は伝わる想定。発見性に問題が出た場合は後追いで小さな heading を足す余地は残す
    - **`ExercisePlanPickerCard` 削除**: 中間コンポーネントを置く動機が消えたため削除。`ExercisePlanSection` が `ExerciseSelector` を直接 import する
    - **種目選択 → セット定義の自動接続**: 当初は種目選択直後に `SetPlanFormDialog`（1セット目を追加）を自動オープンする実装にしたが、モバイルで「picker Drawer 閉 → 即セット定義 Drawer 開」の Drawer 連発になることを懸念して撤回。NN/g「Bottom Sheets」も「sheet は transient で、マルチステップフローには使わない」と明言しており、`product sheet → reviews sheet` のスタック例で「Back と × の使い分けで混乱する」と指摘。本ケースはスタックではなく閉→開の連発だが、Drawer の連続展開は同種の違和感を生む
    - **採用: 自動オープンせず「セットを追加」trigger に autoFocus**（Plan B）: dialog は開かず、新しく追加された種目計画の `SetPlanAddTriggerButton` に `autoFocus` を当てる。ユーザーが Enter / Space / タップで能動的にダイアログを開く。NN/g 推奨に整合、押し付けがましくなく、「触って学べる」UX とも一貫。実装:
      - `SetPlanAddTriggerButton` に `autoFocus?: boolean | undefined` prop を追加（react-aria-components の `Button` に流す）
      - `SetPlanSection` に `autoFocusAddTrigger?: boolean | undefined` prop を追加し、`lastSetPlan === undefined`（= just-added）分岐の trigger に渡す
      - `ProgramDetail` に `lastAddedExercisePlanId?: string | undefined` prop を追加し、children 描画で `autoFocusAddTrigger={exercisePlan.id === lastAddedExercisePlanId}` を計算
      - consumer（apps/web）は「直近追加した exercise plan の id」を state で保持。`autoFocus` は mount 時しか効かないため、明示的にクリアしなくても挙動は壊れない
    - **将来の検討**: 「種目選択とセット定義を 1 つの Drawer 内で wizard 化」（NN/g 推奨パターン）は理想形だが、本 PR スコープを大きく超えるため別タスク候補として残す
- [x] 2-3-13. Day 追加アクション + Day 削除 + ストーリー
  - 説明: Day 追加ボタン（Day 1件以上の通常状態時）、`onAddDay` コールバック、追加直後のフォーカス移動。削除は Menu 経由 (`onDeleteDay`)
  - 完了条件: 通常状態での追加ボタン、追加発火、削除メニュー発火のストーリーが表示
  - **追加ボタンの配置 (2026-05-23)**: TabList の右隣に独立 `Button`（intent="plain", size="sq-xs", `PlusIcon`）として配置。ScrollArea (`flex-1`) と並列の flex 行で、`border-border border-b` をラッパー側に持たせて TabList 直下の border と一体化させた。NotebookLM / VS Code Editor タブの「+」と同じ思想で、`ExerciseSelector` をリスト末尾に直接配置する 2-3-12 のパターンと整合
  - **削除 UI (2026-05-23)**: 当初は TabPanel 上端のヘッダー行（最初は `XMarkIcon` 単体、次に「× Day を削除」テキスト付きボタン）に配置したが、実機確認の往復で 2 度ともしっくり来ず、最終的に **各タブヘッダー内に `XMarkIcon` の Close Button を埋め込む形式**（VS Code Editor タブ / Chrome タブと同じ思想）に着地。経緯:
    1. **初稿**: TabPanel 右上に `XMarkIcon` 単体ボタン → 直下の種目計画カードの × と縦に並んで視認性が落ちる問題が発覚（設計判断 #71 で `TrashIcon → XMarkIcon` に変えた経緯と同じ問題が階層レベルで再発）
    2. **2 稿**: 「× Day を削除」テキスト付きボタン（`size="xs"` + 「Day を削除」ラベル）→ 縦並び問題は解消するが、本来想定していたのは「タブ自体に × を付ける形」（NotebookLM / VS Code 系の closable tab パターン）だったため再修正
    3. **確定**: 各 Tab に `<XMarkIcon>` Button をネスト（`Tab` に `aria-label={day.label}` を付けて accessible name を制限、内側の `Button` は `aria-label={"${day.label}を削除"}` で独立した clickable element として扱う）。HTML 仕様上 React Aria の Tab は `<div role="tab">` なので button-in-button にはならず、React Aria の `usePress` が内側 Pressable の click を Tab 選択に伝播しないため伝播対策のコードも不要
  - **削除ボタン採用パターン**: 当初は全タブに常時 × 表示（VS Code Editor 的）としていたが、2-3-14 の Day ラベル編集追加後に編集アイコンと削除アイコンが各タブへ並び視覚ノイズが増えたため、2026-05-27 に Day 操作ポップオーバーへ統合。確認ダイアログは設計判断 #71 と一貫させて出さない（誤削除は undo/redo で担保する別 breakdown 前提）
  - **削除後の selected フォールバック**: `selectedDayId` が `days` に含まれなくなった場合（= 選択中の Day を削除）は、`firstDayId`（残った最初の Day）を effective selected key として使う inline 計算で対応。`useEffect` での state 同期は避け、render 時の派生計算で済ませる（`react.md`「派生値は計算で求める」）
  - **Day 追加直後の自動選択 (2026-05-23)**: Tabs を controlled に変更（`selectedKey` / `onSelectionChange`）。`lastAddedDayId` props を受け、内部 state `selectedDayId` と組み合わせて表示すべき key を決定する。`lastAddedDayId` の変化検知は `useEffect` ではなく前回値比較パターン（[Adjusting some state when a prop changes](https://ja.react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)）で実装。SetPlan の `autoFocusAddTrigger` と同じく「直近追加した id」を consumer が保持して props で渡す形
  - **ストーリー追加**: `AddDayFromExistingDays`（「+ Day」押下 → onAddDay 発火 → Day 4 タブが `aria-selected="true"` になりラベル編集 TextField に focus することを play test で検証） / `DeleteDayInvokesCallback`（Day 操作メニューの「削除」押下 → `onDeleteDay("d1")` 発火を検証）。StatefulProgramDetail に `handleDeleteDay` / `lastAddedDayId` state を追加し追加→自動選択→ラベル編集フローを実体験可能に
- [x] 2-3-14. Day ラベルインライン編集 + ストーリー
  - 説明: 2-3-10 のテンプレートを流用。Day 操作メニュー → TextField → Enter / Escape
  - 完了条件: 編集ストーリーが表示
  - 実装メモ: Day タブ内のラベル横には `EllipsisVerticalIcon` の操作ポップオーバーのみを置き、ポップオーバー内に「名前を変更」「削除」を配置。名前変更でコンパクトな TextField に切り替える。Enter / blur で空文字以外を `onChangeDayLabel(dayId, label)` に保存、Escape で破棄。Day 追加直後は新規 Day のラベル編集状態を自動開始し、ユーザーが名前を変えない場合はそのまま blur で確定できる。Storybook は stateful wrapper に label 更新を反映し、Enter 保存 / Escape 破棄 / Day 追加直後の編集 focus の play test を追加

###### プログラムレベルのアクション

- [x] 2-3-15. プログラム名/メタ情報のインライン編集 + ストーリー
  - 説明: 2-3-10 のテンプレートを流用。設計判断 #54 で「新規作成は V16 で扱う」方針のため、本タスクは **既存編集 (UC_A_6) のインライン編集のみ** を扱う
  - 完了条件: 編集ストーリーが表示
  - 実装メモ: `ProgramInfo` を `program-detail/` 配下にコロケーションし、ヘッダーのプログラム操作メニューからプログラム名 + メモの編集 dialog を開く。Day ラベル編集と同じく desktop は Popover、mobile は Drawer に切り替え、ヘッダー自体は差し替えずレイアウトシフトを避ける。名前は必須で空文字時は確定ボタンを disabled、メモは任意で空文字確定時に `null` として `onChangeProgramInfo({ name, meta })` へ渡す。Escape / キャンセルで破棄、確定ボタンで保存。フォームは `ProgramInfoForm`、表示と開閉は `ProgramInfo`、responsive dialog は `ProgramInfoDialog` に分離。メモ入力には `TextArea` primitive を追加して使用。Storybook は stateful wrapper に name/meta 更新を反映し、保存と Escape 破棄の play test を追加
- [x] 2-3-16. プログラム複製アクション + ストーリー
  - 説明: ビュー上部のコンテキストメニュー (Menu) に「コピーして新規作成」を配置。`onDuplicate` コールバック
  - 完了条件: コンテキストメニューから複製が発火するストーリーが表示
  - 実装メモ: ヘッダー右上に `ProgramActionsMenu` を追加し、「情報を編集」と「コピーして新規作成」を同じ操作メニューへ集約。コピーして新規作成は `onDuplicate()` を呼び出す。編集 dialog は Day ラベル編集と同じく、メニュー表示中と dialog 表示中で同じ `ProgramActionsTrigger` を差し替える構成にし、Popover/Drawer のアンカーとレイアウトを安定させる。Storybook は `DuplicateProgramInvokesCallback` を追加し、メニューから「コピーして新規作成」を押すと `onDuplicate` が呼ばれることを play test で検証
- [x] 2-3-17. プログラム削除アクション + 確認ダイアログ + ストーリー
  - 説明: ビュー上部のコンテキストメニュー (Menu) に danger item「削除」を配置。確認ダイアログ経由で `onDelete` を発火
  - 完了条件: 削除メニュー押下→確認ダイアログ表示→確定で `onDelete` 発火するストーリーが表示
  - 実装メモ: `ProgramActionsMenu` に danger item「削除」を追加し、選択時に `ProgramDeleteDialog` を開く。確認 UI は `Modal` primitive を使わず view 側で desktop=Popover / mobile=Drawer を切り替え、`role="alertdialog"` を付与する。キャンセルで破棄、確定の「削除」で `onDelete()` を呼び出す。Storybook は `DeleteProgramInvokesCallbackAfterConfirm` を追加し、メニュー押下→確認ダイアログ表示→確定で `onDelete` が呼ばれることを play test で検証

###### 導線

- [x] 2-3-18. V10（計画実績比較）導線のprops + ストーリー
  - 説明: 計画実績確認への遷移コールバック
  - 完了条件: 導線表示のストーリーが表示
  - 実装メモ: `ProgramDetail` の `Day` に実施履歴 `workouts` を追加し、各 Day パネル下部に `WorkoutHistorySection` を表示する。セクション先頭にはプログラム一覧と同じ「新規追加 + 一覧」イディオムで `「{day.label}」を実施する` affordance を置き、押下時に `onStartWorkoutFromDay(dayId)` を呼ぶ。実施履歴は日付降順で並べ、履歴 item 押下時に `onViewPlanRecordComparison(dayId, workoutId)` を呼ぶ。履歴 0 件時は空文言を出さず、実施 affordance のみ表示する。Storybook は実施開始と履歴 item から V10 を開く play test を追加
- [ ] 2-3-19. V13（種目詳細）への遷移 + ストーリー
  - 説明: 種目名タップで V13 へ遷移（旧 2-4-9）
  - 完了条件: 遷移コールバック発火のストーリーが表示
- [ ] 2-3-20. V15 導線 props + ストーリー（Web 限定）
  - 説明: Day 種目推移への遷移（旧 2-4-10）
  - 完了条件: 導線表示のストーリーが表示

###### 状態とレスポンシブ

- [ ] 2-3-21. ローディング/エラー状態ストーリー
  - 説明: プログラム取得中、取得失敗
  - 完了条件: 2状態のストーリーが表示
- [ ] 2-3-22. レスポンシブ検証ストーリー（Day パネル統合後の再確認）
  - 説明: 2-3-2 で TabScrollArea によるタブ部分の対応は完了済み。Day パネル中身（種目計画・セット計画）追加後の小画面/大画面表示を再検証
  - 完了条件: 375px / 1280px 両 Viewport で崩れない

##### 2-4. ~~V3 Day詳細~~ (撤廃: 設計判断 #56 / 2026-05-02 に 2-3 配下へ統合再分解済み)

V3 Day詳細は設計判断 #56 で V2 プログラム詳細に統合（プログラム名・詳細・Day（タブ）・種目計画・セット計画を 1 画面で表示）。2026-05-02 に旧 2-4 タスク群を 2-3 配下 (2-3-4〜2-3-22) に統合再分解済み。対応関係:

| 旧タスク | 新タスク |
|---------|---------|
| 2-4-1 NumberField プリミティブ | 2-3-4 |
| 2-4-2 V3 骨格 + ExercisePlanセクション | 2-3-7 (Day パネル骨格) + 2-3-8 (ExercisePlanRow) + 2-3-9 (SetPlanRow 表示) |
| 2-4-3 空状態ストーリー | 設計判断 #58 によりアプリ層が初期生成するため通常空状態は不要。エッジケース（途中削除）は 2-3-12 に統合 |
| 2-4-4 SetPlanRow のインライン編集 + パターン切替 | 2-3-10 (インライン編集テンプレートタスク) |
| 2-4-5 種目計画・セット計画の削除 | 2-3-11 (セット計画削除) + 2-3-12 (種目計画削除) |
| 2-4-6 Day ラベル編集・Day 削除 | 2-3-13 (Day 削除) + 2-3-14 (Day ラベル編集) |
| 2-4-7 種目追加アクション | 2-3-8 (ExercisePlanRow の ComboBox 表示、設計判断 #57) + 2-3-12 (種目計画追加) |
| 2-4-8 Day 間兄弟移動 | 2-3-2 でタブ切替により実装済み（タスク削除） |
| 2-4-9 V13 への遷移 | 2-3-19 |
| 2-4-10 V15 導線 props（Web 限定） | 2-3-20 |
| 2-4-11 ローディング/エラー状態 | 2-3-21 |
| 2-4-12 レスポンシブ検証 | 2-3-22 |

##### 2-5. ~~V4 種目選択~~ (撤廃: 設計判断 #57 / 2026-05-02 に 2-3 配下へ統合再分解済み)

V4 種目選択は設計判断 #57 で撤廃し、V2 内の ComboBox（広画面=Popover、狭画面=Drawer）に集約。2026-05-02 に旧 2-5 タスク群を 2-3 配下 (2-3-6, 2-3-8, 2-3-12) に統合再分解済み。対応関係:

| 旧タスク | 新タスク |
|---------|---------|
| 2-5-1 SearchField / ListBox プリミティブ | 2-3-6 (ComboBox プリミティブとして取得、SearchField/ListBox は内部で利用) |
| 2-5-2 V4 骨格 | 不要（ComboBox プリミティブのストーリーで代替） |
| 2-5-3 空状態/未該当結果 | ComboBox プリミティブのストーリーで吸収 (2-3-6) |
| 2-5-4 検索フィルター挙動 | ComboBox プリミティブの内蔵機能 (2-3-6) |
| 2-5-5 種目選択コールバック | 2-3-8 (ExercisePlanRow での種目選択) + 2-3-12 (種目計画追加) |
| 2-5-6 ローディング/エラー状態 | 不要（ComboBox プリミティブのストーリーで吸収） |
| 2-5-7 ページング戦略 | 不要（ComboBox は検索 + virtualization でスケール） |

##### 2-6. V16 プログラム新規作成 (新設: 設計判断 #54)

新規作成フローの最初のセクション。プログラム名 + 詳細を入力し、「手動で入力」/「AIで生成」(将来) ボタンで V17 へ遷移する。フォーム形式 (全フィールド常時編集モード)、フォーム全体 valid のタイミングで都度保存。

タスク詳細は実装着手時に再分解する (骨格レベルのリストのみここに残す):

- [ ] 2-6-1. propsインターフェース設計 + 通常状態ストーリー
- [ ] 2-6-2. プログラム名フィールド (TextField, バリデーション含む)
- [ ] 2-6-3. プログラム詳細フィールド (TextArea, 任意入力)
- [ ] 2-6-4. 「手動で入力」ボタン → onContinue コールバック発火
- [ ] 2-6-5. 「AIで生成」ボタンの placeholder (将来実装、disabled 表示)
- [ ] 2-6-6. フォーム valid 監視と都度保存コールバック
- [ ] 2-6-7. ローディング/エラー状態ストーリー
- [ ] 2-6-8. レスポンシブ検証ストーリー

##### 2-7. V17 Day新規作成 (新設: 設計判断 #55)

新規作成フローの第二セクション。Day名 (プレースホルダー「Day 1」) + 種目計画 (種目未選択 + ComboBox) + セット計画 (値未入力 + 微調整ステッパー) を入力。設計判断 #58 でアプリ層が初期構造 (`Day×1 + 種目計画×1 + セット計画×1`) を渡し、ユーザーは値を埋めていく。完了 → V2 へ遷移。

タスク詳細は実装着手時に再分解する (骨格レベルのリストのみここに残す):

- [ ] 2-7-1. propsインターフェース設計 + 通常状態ストーリー
- [ ] 2-7-2. Day名フィールド (TextField, デフォルト「Day 1」, インライン編集ではなくフォーム形式)
- [ ] 2-7-3. 種目計画セクション + 種目未選択時の ComboBox 配置 (設計判断 #57)
- [ ] 2-7-4. セット計画行 (NumberField)。パターンは SetPlan 単位 (設計判断 #59-A) で保持し、パターン指定はセット追加時に行う (設計判断 #62)
- [ ] ~~2-7-5. パターン切替時の値全クリア (設計判断 #59-B)~~ (撤回: 設計判断 #62 で編集UIからパターン切替を撤去したため不要)
- [ ] 2-7-6. セット追加時の直前セット継承 (値+パターン、設計判断 #59-C)
- [ ] 2-7-7. 種目計画追加時の初期構造リセット (設計判断 #59-D)
- [ ] 2-7-8. 微調整ステッパー (`-2.5kg/+2.5kg/-1回/+1回`、刻み量は種目スキーマから受け取る、設計判断 #59-E、`exercises` への `weightStep`/`repsStep` 追加は別 Issue)
- [ ] 2-7-9. Day追加アクション (複数 Day 作成時)
- [ ] 2-7-10. 「完了」ボタン → V2 への遷移コールバック
- [ ] 2-7-11. フォーム valid 監視と都度保存コールバック
- [ ] 2-7-12. ローディング/エラー状態ストーリー
- [ ] 2-7-13. レスポンシブ検証ストーリー

#### 3. ワークアウト記録フロー

##### 3-1. V5+V8 ワークアウト開始+履歴

- [ ] 3-1-1. レイアウト骨格（上部=開始 / 下部=履歴） + GymContext ラップ + 通常状態ストーリー
  - 説明: ビュー全体を `GymContext` で包む。`WorkoutStartSection`, `WorkoutHistoryList`, `WorkoutHistoryItem` をコロケーション
  - 完了条件: 通常状態ストーリーが表示（密度はComfortable）
- [ ] 3-1-2. 直近プログラムサジェストのprops設計 + ストーリー
  - 説明: 最近使用したプログラムの優先表示
  - 完了条件: ストーリーが表示
- [ ] 3-1-3. プログラム選択→Day選択→開始コールバック + ストーリー
  - 説明: 3ステップのワークアウト開始フロー
  - 完了条件: 各ステップのストーリーが表示
- [ ] 3-1-4. アドホックワークアウト開始のUI詳細確定 + 実装
  - 説明: Day紐づけなしで開始するUIをここで確定（NOTE-2）
  - 完了条件: UI詳細が決定し、ストーリーが表示
- [ ] 3-1-5. 履歴空状態ストーリー
  - 説明: 初回・記録なし
  - 完了条件: ストーリーが表示
- [ ] 3-1-6. 履歴削除（コンテキストメニュー/スワイプ） + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 3-1-7. 履歴からV9への遷移 + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 3-1-8. V6完了時のトースト通知表示 + ストーリー
  - 説明: Toast プリミティブを `pnpm ui:fetch` で取得、意見を剥がして `src/primitives/toast.tsx` に配置。「記録しました」+「詳細を確認する」ボタン（V9導線）
  - 完了条件: Toast プリミティブが存在。トースト表示のストーリーが表示
- [ ] 3-1-9. ローディング/エラー状態ストーリー
  - 説明: ワークアウト履歴取得中・失敗。ワークアウト開始セクションは形式上ローディングなし
  - 完了条件: 2状態のストーリーが表示
- [ ] 3-1-10. 履歴リストのページング戦略の確定 + 該当状態のストーリー
  - 説明: 長期利用で増えやすいデータ。ページ位置保持の必要性も含めて検討
  - 完了条件: 戦略が決定し、該当状態のストーリーが表示
- [ ] 3-1-11. レスポンシブ検証ストーリー
  - 完了条件: Viewport 切替時に崩れない

##### 3-2. V6 セット記録

- [ ] 3-2-1. GymContext ラップ + レイアウト骨格 + 通常状態ストーリー
  - 説明: 現在種目 + セット計画プレビュー + 大きな入力エリア。`SetRecordInput`, `ExerciseRecordSection` をコロケーション
  - 完了条件: 通常状態ストーリーが表示
- [ ] 3-2-2. セット記録ボタン（メインアクション、大）+ コールバック + ストーリー
  - 説明: `num-xl` など数値用タイポスケール活用
  - 完了条件: ストーリーが表示
- [ ] 3-2-3. 入力単位プリセット変更確認ダイアログ + ストーリー
  - 説明: 入力単位が `exercises.default_weight_input_unit` と異なるとき、モードレス（トースト風）で「この種目の入力単位を◯◯に変更しますか？」を提示。ADR-027 由来
  - 完了条件: モードレスダイアログ表示のストーリーが表示。プリセット更新コールバックが発火
- [ ] 3-2-4. インライン数値編集（過去セット修正） + ストーリー
  - 説明: 記録済みセットの重量/回数を直接編集
  - 完了条件: ストーリーが表示
- [ ] 3-2-5. RPE入力のUI詳細確定 + 実装 + ストーリー
  - 説明: 数値/スライダー/プリセットのいずれかを本タスクで決定
  - 完了条件: UI詳細が決定し、ストーリーが表示
- [ ] 3-2-6. メモ入力フィールド + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 3-2-7. ワークアウト完了ボタン + コールバック（トースト連携情報含む） + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 3-2-8. 同セッション内の種目切替 + ストーリー
  - 説明: 次の種目へ進む導線
  - 完了条件: ストーリーが表示
- [ ] 3-2-9. V13導線（控えめ） + ストーリー
  - 説明: 記録中の集中を妨げない表現
  - 完了条件: ストーリーが表示（視覚的優先度が低いことが確認できる）
- [ ] 3-2-10. ローディング/エラー状態ストーリー
  - 説明: ワークアウト初期化中、記録送信中、送信失敗
  - 完了条件: 状態のストーリーが表示
- [ ] 3-2-11. レスポンシブ検証ストーリー
  - 完了条件: Viewport 切替時に崩れない

##### 3-3. V9 ワークアウト詳細

- [ ] 3-3-1. propsインターフェース + 通常状態ストーリー（GymContextなし）
  - 説明: 日時ヘッダ + 種目記録セクション + セット記録行。ジム外経路（V5+V8履歴から）想定
  - 完了条件: 通常状態ストーリーが表示
- [ ] 3-3-2. ジム内経路ストーリー（呼び出し元で GymContext ラップ）
  - 説明: V6完了後トースト経由を想定。ビュー本体は1つ
  - 完了条件: GymContext ありストーリーが表示（密度がComfortable）
- [ ] 3-3-3. セット記録のインライン事後修正 + ストーリー
  - 説明: 過去のセット数値を編集
  - 完了条件: ストーリーが表示
- [ ] 3-3-4. 種目名タップでV13遷移 + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 3-3-5. V10導線（Day紐づきあり/なし） + ストーリー
  - 説明: アドホックワークアウト時はV10導線を出さない等の条件表示
  - 完了条件: 2パターンのストーリーが表示
- [ ] 3-3-6. ローディング/エラー状態ストーリー
  - 完了条件: 2状態のストーリーが表示
- [ ] 3-3-7. レスポンシブ検証ストーリー
  - 完了条件: Viewport 切替時に崩れない

#### 4. 種目管理フロー

##### 4-1. V12 種目一覧

- [ ] 4-1-1. V12 骨格 + 通常状態ストーリー
  - 説明: 種目リスト + 1RMインライン表示。`ExerciseListItem`, `OneRMInlineDisplay` をコロケーション
  - 完了条件: 通常状態ストーリーが表示
- [ ] 4-1-2. 1RM未設定の種目表示 + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-1-3. 空状態（種目ゼロ） + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-1-4. 種目フィルター挙動 + ストーリー
  - 説明: V4で追加したSearchFieldプリミティブを再利用
  - 完了条件: ストーリーが表示
- [ ] 4-1-5. 種目登録アクションコールバック + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-1-6. 種目削除コンテキストメニュー + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-1-7. 種目選択（V13遷移）コールバック + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-1-8. ローディング/エラー状態ストーリー
  - 完了条件: 2状態のストーリーが表示
- [ ] 4-1-9. ページング戦略の確定 + 該当状態のストーリー
  - 説明: 種目マスタは増加が緩やかだが上限なし。判断材料を整理して決定
  - 完了条件: 戦略が決定し、該当状態のストーリーが表示

##### 4-2. V13 種目詳細

- [ ] 4-2-1. propsインターフェース + 通常状態ストーリー（GymContextなし）
  - 説明: 種目名 + 1RM + e1RM + V11導線
  - 完了条件: 通常状態ストーリーが表示
- [ ] 4-2-2. ジム内経路ストーリー（呼び出し元で GymContext ラップ）
  - 完了条件: ストーリーが表示
- [ ] 4-2-3. 種目名インライン編集 + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-2-4. 入力単位プリセット（default_weight_input_unit）編集UI + ストーリー
  - 説明: 種目の入力単位プリセット（kg/lbs）を編集するUI。ADR-027 で「種目詳細ビューで明示編集」と定義された導線
  - 完了条件: kg/lbs切替UIのストーリーが表示。プリセット更新コールバックが発火
- [ ] 4-2-5. 1RM登録/更新UI + ストーリー
  - 説明: `OneRMEditor` をコロケーション
  - 完了条件: ストーリーが表示
- [ ] 4-2-6. 1RM未設定状態 + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-2-7. 1RM削除（コンテキストメニュー） + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-2-8. e1RM表示 + 採用ボタン + ストーリー
  - 説明: `E1RMAdoptButton` をコロケーション
  - 完了条件: ストーリーが表示
- [ ] 4-2-9. V11導線 + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 4-2-10. ローディング/エラー状態ストーリー
  - 完了条件: 2状態のストーリーが表示
- [ ] 4-2-11. レスポンシブ検証ストーリー
  - 完了条件: Viewport 切替時に崩れない

#### 5. 分析フロー

##### 5-1. V10 計画実績比較

- [ ] 5-1-1. propsインターフェース + 通常状態ストーリー（計画あり+記録あり）
  - 説明: `PlanRecordExerciseSection`, `PlanRecordComparisonRow` をコロケーション
  - 完了条件: 通常状態ストーリーが表示
- [ ] 5-1-2. 計画のみ / 記録のみ / 部分的に記録された状態 + ストーリー
  - 完了条件: 3状態のストーリーが表示
- [ ] 5-1-3. アドホックワークアウト（計画なし）のフォールバック + ストーリー
  - 説明: V9から呼ばれた場合の表示
  - 完了条件: ストーリーが表示
- [ ] 5-1-4. 呼び出し元（V2/V9）の差を反映するprops + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 5-1-5. ローディング/エラー状態ストーリー
  - 完了条件: 2状態のストーリーが表示
- [ ] 5-1-6. レスポンシブ検証ストーリー
  - 完了条件: Viewport 切替時に崩れない

##### 5-2. V11 推移グラフ

- [ ] 5-2-1. チャートライブラリ選定のADR作成
  - 説明: Recharts / Visx / ECharts / 自作（React Aria + SVG）のpros/cons整理とユーザー合意
  - 完了条件: ADRが作成され、ライブラリが `packages/react-components/package.json` に追加されている
- [ ] 5-2-2. propsインターフェース + 通常状態ストーリー（時系列データ）
  - 説明: `TrendChart` をコロケーション
  - 完了条件: 通常状態ストーリーが表示
- [ ] 5-2-3. 期間選択フィルター + ストーリー
  - 完了条件: ストーリーが表示
- [ ] 5-2-4. データ不足（1点のみ/空） + ストーリー
  - 完了条件: 2パターンのストーリーが表示
- [ ] 5-2-5. ローディング/エラー状態ストーリー
  - 完了条件: 2状態のストーリーが表示
- [ ] 5-2-6. レスポンシブ検証ストーリー
  - 完了条件: Viewport 切替時に崩れない

##### 5-3. V15 Day種目推移（Web限定）

- [ ] 5-3-1. 表示形式の確定（NOTE-1）
  - 説明: オーバーレイ / サイドパネル / モーダル / インラインパネルのいずれかをここで決定
  - 完了条件: 表示形式が決定し、breakdown.md または当該コミットメッセージに記録
- [ ] 5-3-2. propsインターフェース + 通常状態ストーリー
  - 説明: V11簡易版として実装。V11の `TrendChart` を再利用する場合は `src/views/` 直下に昇格させる（昇格ルール参照）
  - 完了条件: ストーリーが表示
- [ ] 5-3-3. V3との統合パターン（レイアウト）の確認ストーリー
  - 説明: V3から呼び出した時のレイアウトパターン
  - 完了条件: ストーリーが表示
- [ ] 5-3-4. ローディング/エラー状態ストーリー
  - 完了条件: 2状態のストーリーが表示
