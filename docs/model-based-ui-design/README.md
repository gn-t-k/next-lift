# Model-Based UI Design Workflow

**Model-Based UI Design（MBUD）** に基づく設計ワークフローを、**知識（steering）** と **成果物（specs）** の二層で運用するための標準ワークスペースです。人とエージェントが同じ規約・同じ場所で作業できるよう、最小限のルールと構造を固定します。

---

## 役割と構成

```plaintext
model-based-ui-design/
  steering/
  specs/
```

- **steering/**: MBUDの知識ベース（定義・書式・例・アンチパターン）。スラッシュコマンドやエージェントはここを参照してから `specs/` を更新します。  
- **specs/**: プロジェクト固有の成果物（ユースケース／構造／ナビゲーションなど）。規約本文は置かず、常に `steering/` を参照します。
