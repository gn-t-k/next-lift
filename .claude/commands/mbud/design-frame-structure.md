---
description: フレーム構造を対話で設計し、docs/model-based-ui-design/specs/04-frame-structure.md を作成/更新します
argument-hint: init | add
---

# フレーム構造設計

あなたはモデルベースUIデザイン（中盤：概念設計）のファシリテーター。ユーザーと対話しながら **単位ビュー**（一覧/詳細/編集など）とその**レイアウト枠組み**を確定し、成果物 @docs/model-based-ui-design/specs/04-frame-structure.mdを整える。

## 参照

- @docs/model-based-ui-design/steering/00-handbook.md
- @docs/model-based-ui-design/steering/03-conceptual-design.md
- @docs/model-based-ui-design/specs/01-use-case-definition.md
- @docs/model-based-ui-design/specs/02-task-analysis.md
- @docs/model-based-ui-design/specs/03-content-structure.md
- @docs/model-based-ui-design/specs/04-frame-structure.md

## モード選択

- `init` : コンテンツ構造から候補ビューを抽出して初期ファイルを生成（既存があれば統合）  
- `add`  : 対話で単位ビューを1件ずつ追加  
- 無指定 : `add` と同等の案内から開始  

## 対話のフロー

1. **インポート**：@参照を読み、コンテンツ構造に基づき主要ビュー候補を抽出  
2. **ビュー名の確認**：一覧/詳細/編集などの役割を確認し、ユーザーに呼称を合意  
3. **関連オブジェクト**：各ビューが扱う概念オブジェクトを列挙  
4. **ナビゲーション方針**：各ビュー間の遷移（戻る/タブ/モーダル等）を整理  
5. **レイアウト枠組み**：ヘッダー/メイン/フッター等に分けて構造を記述  
6. **パッチ出力**：ファイル全体の修正パッチを提示し、適用可否を確認  
7. **保存**：ユーザー承認後に出力を最終化（以降の修正もパッチ提示）  

## 出力ファイルの書式

@docs/model-based-ui-design/specs/04-frame-structure.mdに以下形式で出力する

```markdown
# フレーム構造

@docs/model-based-ui-design/steering/04-frame-structure-design.md の内容をもとに、フレーム構造設計を行います。

## 単位ビュー一覧

### V:<ID> — <ビュー名>
- **役割**: <一覧/詳細/編集など>
- **関連オブジェクト**: <概念オブジェクト列>
- **ナビゲーション**: <遷移方針>
- **レイアウト**: <ヘッダー/コンテンツ/フッター等の枠組み>
- **備考**: <任意メモ>
```

## 作業の原則

- ワイヤーフレームは図ではなくテキストで枠組みを表現
- 表示要素は役割単位（ヘッダー/リスト/フォームなど）にとどめ、UI部品や色は含めない
- 一覧・詳細・編集ビューを基本とし、過不足がないか確認
- グローバルナビゲーションは一貫性を優先し、後からの変更を極力避ける
