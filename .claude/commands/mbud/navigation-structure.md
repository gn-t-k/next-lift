---
description: ナビゲーション構造を対話で整理し、specs/06-navigation-structure.md を作成/更新します
---

# ナビゲーション構造設計

あなたはモデルベースUIデザイン（中盤：構造設計）のファシリテーター。  
ユーザーと対話しながら **ナビゲーションの全体像** と **状態遷移の詳細** を整理し、成果物specs/06-navigation-structure.mdを整える。

## 参照

- @docs/model-based-ui-design/steering/00-handbook.md
- @docs/model-based-ui-design/steering/04-navigation-structure.md
- @docs/model-based-ui-design/specs/01-use-case-definition.md
- @docs/model-based-ui-design/specs/02-task-analysis.md
- @docs/model-based-ui-design/specs/03-content-structure.md
- @docs/model-based-ui-design/specs/04-frame-structure.md
- @docs/model-based-ui-design/specs/05-concept-definition

## 対話フロー

1. **全体像の抽出**  
   - フレーム構造の単位ビューをもとに候補ノードを列挙  
   - グローバルナビゲーション方式（タブ/ドロワー/メニュー）を確認  

2. **基本遷移の定義**  
   - 各ビュー間の移動（一覧→詳細→編集など）  
   - 遷移手段（タブ/リンク/モーダル）と戻り先  

3. **例外・モードの検討**  
   - ログイン前/後など状態による分岐を整理  

4. **詳細化（2回目以降）**  
   - 各ノードにstate/guard/mode/effectを追加  

5. **パッチ出力**  
   - YAMLを正として出力  
   - Mermaidを併記（可視化用）  
   - 修正パッチを提示し、承認後保存  

## 出力ファイルの書式

````markdown
# ナビゲーション構造設計

## overview (YAML 正)

```yaml
nodes:
  - id: home
    name: トップ
    kind: view
    entry: true
  - id: playlist.detail
    name: プレイリスト詳細
    kind: view
  - id: track.edit
    name: トラック編集
    kind: modal

edges:
  - from: home
    to: playlist.detail
    trigger: プレイリストを選択
    return: home
  - from: playlist.detail
    to: track.edit
    trigger: 編集
    mode: modal
    return: playlist.detail
```

## diagram (Mermaid)

```mermaid
flowchart TB
  home["トップ"] -->|プレイリスト選択| playlist_detail["プレイリスト詳細"]
  playlist_detail -->|編集| track_edit(["トラック編集（モーダル）"])
  track_edit -->|保存/キャンセル| playlist_detail
  playlist_detail -->|戻る| home
```

## details (state/guard 追加例)

```yaml
nodes:
  - id: playlist.detail
    states:
      - id: loading
        desc: 取得中
      - id: error
        desc: エラー
edges:
  - from: playlist.detail
    to: playlist.detail
    trigger: 再試行
    guard: state==error
    effect: 再取得
```
````
