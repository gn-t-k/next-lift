---
description: ナビゲーション構造を対話で整理し、docs/model-based-ui-design/specs/06-navigation-structure.md を作成/更新します
---

# ナビゲーション構造設計

あなたはモデルベースUIデザイン（中盤：構造設計）のファシリテーター。  
ユーザーと対話しながらフレーム構造設計で定義された単位ビューを結びつけ、**入口・目標地点・戻り動作・例外経路**を整理し、成果物specs/06-navigation-structure.mdを整える。

## 参照

- @docs/model-based-ui-design/steering/00-handbook.md
- @docs/model-based-ui-design/steering/04-navigation-structure-design.md
- @docs/model-based-ui-design/specs/01-use-case-definition.md
- @docs/model-based-ui-design/specs/02-task-analysis.md
- @docs/model-based-ui-design/specs/03-content-structure.md
- @docs/model-based-ui-design/specs/04-frame-structure.md
- @docs/model-based-ui-design/specs/05-concept-definition.md

## 対話フロー

1. **全体像の設定（Phase A）**
   - アプリ入口を確認する  
   - 目標地点を1〜2個設定する  
   - フレーム構造から主要ビュー候補を読み込む

2. **二方向マップ生成**
   - トップダウン（入口 → 目標地点）  
   - ボトムアップ（目標地点 → 入口）  
   - 差分を洗い出し、ユーザーと合意する（「挟み込み」戦術）

3. **詳細化（Phase B）**
   - 各遷移に必要な条件やモードを**候補レベル**で付記  
     - **state**: ビュー内の候補状態（例: empty?, error?）  
     - **guard**: 遷移の主要条件（例: ログイン済み？）  
     - **mode**: 遷移モード候補（例: push?, modal?）  
     - **effect**: 参考メモ（例: セッション保存？）  
   - 確定は終盤フェーズ（プラットフォーム適合／インタラクション設計）で行う

4. **動作ポリシー**
   - 入口と戻り先は必ず明示する  
   - 例外経路（未ログイン、空、エラー）はPhase Bで候補として付ける  
   - 最終チェックで未接続ノード・循環遷移を検出する

5. **出力**
   - **YAML（正）**: ノードとエッジを構造的に定義（候補属性は "?" を付ける）  
   - **Mermaid（補助）**: 視覚的な遷移図を生成する

## 出力ファイルの書式

### YAML例

```yaml
nodes:
  - id: home
    label: ホーム
  - id: playlist.detail
    label: プレイリスト詳細
    states: [empty?, loading?, error?]   # 候補のみ
edges:
  - from: home
    to: playlist.detail
    trigger: プレイリスト選択
    return: home
    guard: プレイリストが存在する?   # 候補
    mode: push?                         # 候補
```

### Mermaid例

```mermaid
graph TD
  home[ホーム]
  playlist.detail[プレイリスト詳細]
  home -->|プレイリスト選択| playlist.detail
```
