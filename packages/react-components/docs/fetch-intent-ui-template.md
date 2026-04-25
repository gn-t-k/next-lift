# Intent UI テンプレート取得手順

`pnpm ui:fetch` で Intent UI から取得したファイルは `src/.intent-templates/`（git 管理外）に書き込まれる。これらは **参照用テンプレート** として扱い、`src/primitive/` には参考にしながら新規ファイルとして書き起こす。

詳細な背景は [ADR-024: プリミティブ層ポリシーと2層 + 昇格ルール](../../../docs/architecture-decision-record/024-primitive-layer-policy.md) を参照。

## 手順

### 1. テンプレートを取得

```bash
cd packages/react-components
pnpm ui:fetch @intentui/<component-name>
```

例: `pnpm ui:fetch @intentui/text-field`

書き込み先:

- `src/.intent-templates/ui/<name>.tsx` — メインコンポーネントとサブコンポーネント
- `src/.intent-templates/lib/*.ts` — ユーティリティ（`cx` 等。既存の `src/lib/utils.ts` と重複する場合あり）
- `src/.intent-templates/hooks/*.ts` — カスタムフック（取得物による）

### 2. テンプレートを精査

取得したファイルを読み、以下を確認する:

- **意見の混入**: 画面幅で挙動を切り替える、ドメイン用語が混入している、固定のスタイル選択肢を強制する、等
- **Props の妥当性**: 余計な props が露出していないか、型が緩すぎないか
- **依存関係**: `react-aria-components` の使い方、サブコンポーネントの分け方、スタイル変数（`tv`）の使い方
- **アクセシビリティ挙動**: ARIA 属性、フォーカス管理、キーボード操作

### 3. `src/primitive/` に新規ファイルとして書き起こす

テンプレートをコピーするのではなく、**参考にしながらゼロから書く**。プロジェクトの規約に従う:

- アロー関数 + `FC` 型注釈（`export const` 形式）
- 1ファイル1 export（サブコンポーネントは別ファイルに分割）
- タブインデント
- import パスは相対 import か `@next-lift/react-components/lib`
- 既存の `cx`（`src/lib/utils.ts`）を使う。テンプレ内の `cx` を `src/lib/` にコピーしない
- 「意見」は剥がす。剥がしきれない粒度のものは React Aria Components から書き直す
- 不要なサブコンポーネントは取り込まない（YAGNI）

### 4. `src/primitive/index.ts` に export を追加

```ts
export * from "./<new-component>";
```

### 5. ストーリーを作成

`src/primitive/<new-component>.stories.tsx` を追加し、Storybook で表示確認する。

### 6. テンプレートをクリーンアップ

取り込み完了後、`src/.intent-templates/` 配下の取得物は不要になる。複数同時取得していなければ削除して構わない（gitignore されているので残しても害はないが、混乱を避けるため）。

```bash
rm -rf src/.intent-templates/ui/<name>.tsx
```

## 観察された挙動メモ（2026-04-25 時点）

- shadcn CLI は `components.json` の `aliases.ui` / `aliases.lib` 等から書き込み先を決定する
- `aliases` に存在しないキーで参照されるファイル（例: `hooks/`）は対応する alias がないとエラーになる可能性あり
- 同一コンポーネントが依存する他のプリミティブ（`text-field` → `field`）も自動取得される
- 既存ファイルがある場合は上書き確認のプロンプトが出る。`--yes --overwrite` で抑制可能
- 生成コードの import は `@next-lift/lib/primitive` のような **存在しないパスを指している** ことがある（テンプレート由来）

## Props 設計の方針

ビュー層・プリミティブ層ともに「ビューにとって都合のよい型」を props として受け取る。ドメイン型を直接受け取らない。詳細は `docs/development/2026-04-24-unit-views-implementation/breakdown.md` の「Props設計方針」を参照。
