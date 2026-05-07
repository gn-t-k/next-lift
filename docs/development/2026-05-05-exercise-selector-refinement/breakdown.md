# Breakdown: ExerciseSelector の振る舞い洗練 + 単体テスト整備

## ステータス

- 状態: 完了
- 現在のフェーズ: 5/5
- 最終更新: 2026-05-06

## 要件サマリー

PR #735 のレビューで明らかになった ExerciseSelector の振る舞い不備（選択中の表示・選択中ハイライト・登録候補の常時表示・重複登録防止）を解消し、Storybook play test で網羅的に検証する。実装は次セッションで `/tdd` を使って進める想定。

- 親要件 breakdown: `docs/development/2026-04-24-unit-views-implementation/breakdown.md` 2-3-8（picker 単体整備）と 2-3-12（種目計画追加で ExercisePlanRow に統合）
- スコープ:
  - `packages/react-components/src/views/program-detail/exercise-selector.tsx` の API と振る舞い改修
  - `packages/react-components/src/views/program-detail/exercise-selector.stories.tsx` のストーリー整備と play test 追加
  - ExercisePlanRow への統合は **本スコープ外**（2-3-12 で実施）

## 設計概要

### 影響範囲

- `packages/react-components/`:
  - `views/program-detail/exercise-selector.tsx`（実装）
  - `views/program-detail/exercise-selector.stories.tsx`（ストーリー + play test）
  - 公開 API には影響なし（views/index.ts では再エクスポートしない、内部 view 部品）
- `packages/react-components/` の他コンポーネント: 影響なし（ExercisePlanRow / ExercisePlanSection / ProgramDetail は revert 済み）

### アプローチ

既存実装を改修。新規モジュールは追加しない。

#### API 変更

```ts
type Props = {
  availableExercises: SelectableExercise[];          // 据え置き
  selectedExerciseId?: string;                        // 新規追加 (省略可)
  onSelect: (exerciseId: string) => void;             // 据え置き
  onCreateExercise: (name: string) => void;           // optional → required
};
```

#### items 計算ロジック (buildListItems) の再設計

- query 空かどうかの分岐を撤去
- create option を常時注入する
- 「query 空」または「query が既存 exercise と完全一致」のとき create option を `disabled`
- `availableExercises.length === 0` のとき「種目が登録されていません」placeholder item を注入
- query があってマッチが 0 件のとき「一致する種目がありません」placeholder item を注入
- 選択中の exercise はリスト内に存在する場合 `kind: "exercise"` のままだが、表示側で highlight 用に `selectedKey`/`selected` 情報を伝える

#### Popover (広画面)

- `ComboBox` primitive を使う（`menuTrigger="focus"`）
- `selectedKey={selectedExerciseId}` で React Aria 自動の selected highlight + input への name 表示
- React Aria が「items 0 件で popover を閉じる」仕様への対策として、controlled `inputValue` + 手動 items 計算で常に 1 件以上注入（既存パターン継続）
- 選択時: `onSelect(exerciseId)` 発火 + input 内容クリア + popover 閉じる
- 登録時: `onCreateExercise(query)` 発火 + input クリア

#### Drawer (狭画面)

- `Drawer` primitive を使う（`placement="bottom"`、`h-[80dvh]` 固定）
- trigger button: `selectedExerciseId` から該当 exercise を引いて name 表示。未選択は「種目を選択」placeholder
- リスト領域は `flex-1 overflow-y-auto`
- 選択中の Button に `aria-selected` + `bg-accent/60` 等の手動ハイライト
- create button は常時表示。disabled 条件は popover と同じ
- 選択時: `onSelect(exerciseId)` 発火 + drawer close + query クリア
- 登録時: `onCreateExercise(query)` 発火 + drawer close + query クリア

#### 画面幅切替

CSS-only 切替（`md:hidden` / `hidden md:block`）を維持。view 層責務として primitives は意見を持たない。親要件 breakdown 2-3-6.5 と整合。

### 関連ADR

- ADR-024: プリミティブ層ポリシーと2層 + 昇格ルール（ExerciseSelector は views 配下のコロケーション、views/index.ts では再エクスポートしない）

なし（新規 ADR は作らない。設計判断は親要件 breakdown 2-3-8 と本ファイルに記録）。

## タスクツリー

凡例:
- `[?]` 未展開（さらに分解が必要）
- `[ ]` 葉タスク（TDDで着手可能）
- `[x]` 完了

依存関係: 1 → 2 → 3 → 4 → 5/6（5 と 6 は並行可能）。

### 1. 内部ロジックと API の整備

- [x] 1-1. Props 型を更新する
  - 説明: `selectedExerciseId?: string` を追加し、`onCreateExercise` を required に変更する。`InteractiveDemo` などストーリー側の渡し方も合わせて修正する。
  - 完了条件:
    - 型: `Props` に `selectedExerciseId?: string` が含まれ、`onCreateExercise: (name: string) => void` が required である
    - 型: `pnpm --filter @next-lift/react-components type-check` がグリーン
- [x] 1-2. items 計算ロジック (`buildListItems` 相当) を再設計する
  - 説明: query 空かどうかの分岐を撤去し、create option を常時注入する。`disabled` 状態は「query 空」または「`availableExercises.some(e => e.name === trimmedQuery)`」のとき真とする。`ListItem` 型に `disabled` フラグを足す。
  - 完了条件:
    - テスト: 純関数として切り出し、以下のケースを網羅した unit test （Storybook play で十分なら play 側に寄せる）
      - 通常: 全件 + create (enabled)
      - query 空: 全件 + create (disabled)
      - query 部分一致: マッチ件 + create (enabled)
      - query 完全一致 (重複): マッチ件 + create (disabled)
      - 検索結果 0 件: no-match item + create (enabled)
      - 0 件登録 + query 空: empty-list item + create (disabled)
      - 0 件登録 + query 入り: empty-list item + create (enabled)
    - 型: `ListItem` に `disabled: boolean` または `kind: "create-disabled" | "create"` 等が反映されている

### 2. Popover (広画面) の振る舞い改修

- [x] 2-1. selectedKey 経由で選択中表示と自動ハイライトを実装する
  - 説明: ComboBox に `selectedKey={selectedExerciseId ?? null}` を渡す。選択時に input 内容と selectedKey の双方を扱うため、`inputValue` の制御方針を整理する（選択直後は input をクリアし popover を閉じる方針を維持）。
  - 完了条件:
    - テスト (play): selectedExerciseId に対応する exercise の name が ComboBox input に表示される
    - テスト (play): popover を開いたとき、対応する候補項目が `data-[selected]` で視覚的に区別される
- [x] 2-2. create option の disabled 制御 + 文言を実装する
  - 説明: items 計算で disabled になった create item を `<ComboBoxItem isDisabled>` でレンダリングする。文言は「種目「{query}」を登録」（query 空時は単に「種目を登録」）。
  - 完了条件:
    - テスト (play): query 空時に create item が disabled
    - テスト (play): query が既存 exercise の name と完全一致するとき disabled
    - テスト (play): query 部分一致 + 不一致時に enabled で「種目「{query}」を登録」表記
- [x] 2-3. 選択発火・登録発火の挙動を整える
  - 説明: 選択時は `onSelect(exerciseId)` を呼んで `inputValue` を空に戻し popover を閉じる。登録時は `onCreateExercise(query)` を呼んで `inputValue` を空に戻す（popover は React Aria の挙動に任せる）。
  - 完了条件:
    - テスト (play): exercise を選ぶと onSelect が exerciseId で発火し input がクリアされる
    - テスト (play): create option（enabled）を押すと onCreateExercise が query で発火し input がクリアされる

### 3. Drawer (狭画面) の振る舞い改修

- [x] 3-1. trigger button に selected exercise 名を表示する
  - 説明: `selectedExerciseId` から `availableExercises` を引いて name を表示する。未選択は「種目を選択」を muted-fg で表示。selected 時は通常の fg 色。
  - 完了条件:
    - テスト (play): selectedExerciseId 渡し済みのとき trigger button のテキストが exercise の name と一致する
    - テスト (play): selectedExerciseId 未指定のとき trigger button のテキストが「種目を選択」
- [x] 3-2. リスト内で選択中項目を手動ハイライトする
  - 説明: 各候補 Button に `aria-selected={exercise.id === selectedExerciseId}` を付与し、selected 時のスタイル (`bg-accent/60` 等) を当てる。`aria-selected` の付与は `<button>` 直接ではなく `<li role="option">` 経由のほうが a11y 的に正確（実装時に確定）。
  - 完了条件:
    - テスト (play): drawer を開いたとき selected 項目が `aria-selected="true"` を持つ
    - テスト (play): selected 項目に視覚的ハイライトが当たっている（背景色変化を DOM 経由で確認）
- [x] 3-3. create button を常時表示し disabled 条件を実装する
  - 説明: query 空または重複時は disabled にする。文言は popover と揃える（「種目「{query}」を登録」 / query 空時は「種目を登録」）。
  - 完了条件:
    - テスト (play): query 空時 create button が disabled
    - テスト (play): query 完全一致 (重複) 時 disabled
    - テスト (play): query 部分一致だが不一致 (新規) 時 enabled
- [x] 3-4. 選択発火・登録発火の挙動を整える
  - 説明: 選択時は onSelect 発火 + drawer close + query クリア。登録時は onCreateExercise 発火 + drawer close + query クリア。focus は trigger に戻す（react-aria の Modal が標準で行うはず、要確認）。
  - 完了条件:
    - テスト (play): 選択 → onSelect が呼ばれ、drawer が閉じ、focus が trigger に戻る
    - テスト (play): create button (enabled) → onCreateExercise が呼ばれ、drawer が閉じる

### 4. Storybook ストーリーの整備

- [x] 4-1. 既存ストーリーの args を新 API に揃える + 新規シナリオを追加する
  - 説明: 既存の `DesktopPopover` / `MobileDrawer` / `Empty` / `EmptyMobile` / `WithCreate` / `WithCreateMobile` / `Interactive` を新 API に揃える（onCreateExercise を required として渡す、必要に応じて selectedExerciseId を渡す）。新規追加は以下:
    - `WithSelectedDesktop` / `WithSelectedMobile`: selectedExerciseId 指定時の表示確認
    - `DuplicateQueryDesktop` / `DuplicateQueryMobile`: query が既存と完全一致する disabled ケース
    - `EmptyWithCreate` / `EmptyWithCreateMobile`: 0 件 + onCreateExercise 渡しの組み合わせ（既存 `Empty` は onCreateExercise を渡していないので分けるか統合するかは実装時に判断）
  - 完了条件:
    - 確認: Storybook 起動時にすべてのストーリーがエラーなく表示される
    - 型: `pnpm --filter @next-lift/react-components type-check` がグリーン
    - 確認: Storybook サイドバー上で各ストーリーが意味の通る分類になっている

### 5. Popover (広画面) の play test 追加

- [x] 5-1. 通常表示・選択中表示・選択中ハイライトをまとめて検証する play test を書く
  - 説明: Storybook play 関数で Popover ストーリー（`DesktopPopover` または `WithSelectedDesktop`）に対して以下を確認する:
    - フォーカスで popover が展開され、登録済み 10 件すべての候補が `[role="option"]` として存在する
    - selectedExerciseId 指定時、ComboBox input の value が selected exercise の name になる
    - selected の `[role="option"]` が `aria-selected="true"` または `data-selected` を持つ
  - 完了条件:
    - テスト (play): 上記 3 点を `expect` で検証し pass する
- [x] 5-2. 検索フィルター + create option の文言・disabled 挙動を検証する play test を書く
  - 説明: Popover ストーリーに対して以下を確認:
    - query 部分一致でマッチ項目だけ表示、create option が enabled で「種目「{query}」を登録」
    - query 完全一致 (例: "ベンチプレス") で create option が disabled
    - 検索結果 0 件 (例: "存在しない") で「一致する種目がありません」placeholder + create option (enabled) 共存
    - 選択クリックで onSelect 発火 + input クリア + popover 閉じる
    - create option クリックで onCreateExercise 発火 + input クリア
  - 完了条件:
    - テスト (play): 上記 5 シナリオをひと続きの play 関数 or 複数 play 関数で検証し pass する
- [x] 5-3. 0 件登録ケースの play test を書く
  - 説明: 0 件登録 + onCreateExercise 渡しのストーリーで以下を確認:
    - query 空: 「種目が登録されていません」placeholder + create option (disabled) 共存
    - query 入り: 「種目が登録されていません」placeholder + create option (enabled) 共存
  - 完了条件:
    - テスト (play): 2 シナリオを検証し pass する

### 6. Drawer (狭画面) の play test 追加

- [x] 6-1. 通常表示・選択中表示・選択中ハイライトをまとめて検証する play test を書く
  - 説明: Drawer ストーリーで以下を確認:
    - trigger クリック → drawer 展開、登録済み 10 件すべて `<button>` で表示
    - selectedExerciseId 指定時、drawer 閉じた状態の trigger button が selected exercise name を表示
    - drawer 内で selected 項目が `aria-selected="true"` 相当 + 視覚的ハイライト（背景色クラスの存在を DOM で確認）
  - 完了条件:
    - テスト (play): 上記を検証し pass する
- [x] 6-2. 検索フィルター + create button の文言・disabled 挙動を検証する play test を書く
  - 説明: Drawer ストーリーで以下を確認:
    - query 部分一致でマッチ項目だけ表示、create button が enabled
    - query 完全一致で create button disabled
    - 検索結果 0 件で「一致する種目がありません」+ create button (enabled) 共存
    - 選択クリックで onSelect 発火 + drawer close + focus が trigger に戻る
    - create button (enabled) クリックで onCreateExercise 発火 + drawer close
  - 完了条件:
    - テスト (play): 上記 5 シナリオを検証し pass する
- [x] 6-3. 0 件登録ケースの play test を書く
  - 説明: 0 件登録 + onCreateExercise 渡しの Drawer ストーリーで以下を確認:
    - query 空: 「種目が登録されていません」 + create button (disabled) 共存
    - query 入り: 「種目が登録されていません」 + create button (enabled) 共存
  - 完了条件:
    - テスト (play): 2 シナリオを検証し pass する
- [x] 6-4. drawer 高さ安定の play test を書く
  - 説明: Drawer 開いたあと query を変化させ、drawer panel の高さ（boundingClientRect.height）が変わらないことを assertion する。
  - 完了条件:
    - テスト (play): query 空 → 部分一致 → 0 件 と変化させても drawer の高さが等しい

## 議論ログ

### ラウンド1: ExercisePlanRow への統合範囲

- Q: 本スコープに ExercisePlanRow への picker 統合（`exercise === null` 時に呼び出す処理）を含めるか
- A: 含めない。種目計画追加 (親要件 breakdown 2-3-12) で実施する。本スコープは ExerciseSelector 単体の API と振る舞い + テスト整備に絞る
- 判断: ExercisePlanRow への統合タスクは本ファイルに含めない。親要件 breakdown 2-3-12 で picker 統合と一緒に行う

### ラウンド2: create option を常時表示にする是非

- Q: query 空のときに create option を出さない実装と、常時出す実装のどちらにするか
- A: 常時出す。query 空時は disabled で表示。
- 判断: branching を撤廃して仕様を単純化する。`onCreateExercise` も required にして「create を提供しない呼び出し方」をなくす。これにより consumer は picker を使うときに必ず create UX を提供することになる

### ラウンド3: 単体テストの種類

- Q: Vitest + RTL の純粋な unit test か、Storybook play test か
- A: Storybook play test
- 判断: 既存パターン (combo-box.stories.tsx の CreateNewOption) と一貫性を保つ。新たに vitest セットアップを追加するコストを払うほどの規模ではない

### ラウンド4: items 計算ロジックの抽出

- Q: `buildListItems` を独立した純関数として export するか、コンポーネント内に閉じておくか
- A: 実装時に TDD で創発的に決める。本ファイルでは「純関数として独立させると単体テストしやすい」ことに留める
- 判断: タスク 1-2 の完了条件にあえて「純関数として切り出す」を含めず、TDD 過程で必要に応じて抽出する

## 補足: コンテキストクリア後の再開ガイド

次セッションで `/tdd` を使う想定。再開時に必要な情報:

- 作業ブランチ: `feature/program-detail-exercise-selector`（PR #735）
- 対象ファイル: `packages/react-components/src/views/program-detail/exercise-selector{,.stories}.tsx`
- 現状: ベース実装あり、API は古い（onCreateExercise optional, selectedExerciseId なし）
- 次のアクション: 1-1 (Props 型変更) から TDD で進める。各タスクは「テストを書く → 失敗 → 実装 → 通る」のサイクル
- 関連ファイル:
  - 親要件 breakdown: `docs/development/2026-04-24-unit-views-implementation/breakdown.md` の 2-3-8 / 2-3-12
  - 設計の経緯: 同 breakdown の「ステータス」行 + 2-3-8 タスクの実装方針記述
  - PR コメント / レビュー指摘: PR #735 のコメント欄
