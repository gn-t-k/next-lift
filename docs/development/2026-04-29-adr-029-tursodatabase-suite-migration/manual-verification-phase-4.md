# Phase 4 実機動作確認 手順書

ADR-029 Phase 4（iOS の `@op-engineering/op-sqlite` → `@tursodatabase/sync-react-native` 置換）のマージ前に必要な実機検証 7 件をステップバイステップで実施する。

対象 PR: [#736](https://github.com/gn-t-k/next-lift/pull/736) `feature/adr-029-phase-4-ios-replace`

## 前提

- Mac + Xcode 15.x 以降がインストール済み
- iPhone 実機（または iOS Simulator）が利用可能
- CocoaPods が利用可能（`pod --version` で確認）
- worktree `/Users/gntk/repository/next-lift/.claude/worktrees/turso/` が PR ブランチ `feature/adr-029-phase-4-ios-replace` に存在
- Web 側のクラウド DB（Turso Hosted）にアクセス可能。同じユーザーで Web と iOS 両方からアクセスする想定
- 開発端末で旧 `per-user.sqlite` ファイルが残っていても干渉しない（新ファイル名 `per-user.db`）。ただし旧データに依存した検証はできない

## 全体の流れ

```
[STEP 0] ブランチ・依存確認
  ↓
[STEP 1] Expo prebuild & ネイティブビルド ─→ 4.1.2 完了
  ↓
[STEP 2] アプリ起動 + ログイン ─→ 4.1.3（connect 部分）+ 4.4.2（初回 pull）
  ↓
[STEP 3] 書き込み + push 確認 ─→ 4.1.3（push 部分）+ 4.5.1
  ↓
[STEP 4] Pull ボタン + AppState 復帰 ─→ 4.6.1
  ↓
[STEP 5] FK PRAGMA 確認 ─→ 4.7.1（要 一時デバッグコード）
  ↓
[STEP 6] raw SQL 取得 ─→ 4.1.4（要 一時デバッグコード）
  ↓
[STEP 7] トランザクション ROLLBACK ─→ 4.2.2（要 一時デバッグコード）
  ↓
[STEP 8] E2E + コンフリクト ─→ 4.8.1 + 4.8.2
  ↓
[完了] PR を Ready for review に
```

各 STEP の所要時間目安: STEP 1 が 10〜20 分（ビルド時間に依存）、それ以外は各 5〜10 分。STEP 5〜7 は手早く済ませれば 15 分程度で全部回せる。

---

## STEP 0: ブランチ・依存確認

```bash
cd /Users/gntk/repository/next-lift/.claude/worktrees/turso

# ブランチ確認
git branch --show-current
# 期待値: feature/adr-029-phase-4-ios-replace

# クリーンか確認
git status
# 期待値: working tree clean

# 依存をインストール（lockfile に同期）
pnpm install
```

確認:
- [ ] ブランチが `feature/adr-029-phase-4-ios-replace` であること
- [ ] `pnpm install` がエラーなく完了すること
- [ ] `apps/ios/package.json` に `@tursodatabase/sync-react-native: 0.5.3` が含まれること
- [ ] `apps/ios/package.json` に `@next-lift/turso-drizzle-adapter: workspace:*` が含まれること

```bash
grep -E "tursodatabase/sync-react-native|turso-drizzle-adapter" apps/ios/package.json
```

---

## STEP 1: Expo prebuild + iOS ネイティブビルド（4.1.2）

旧 `ios/` ディレクトリが残っている可能性があるため、クリーン prebuild する。

```bash
cd /Users/gntk/repository/next-lift/.claude/worktrees/turso/apps/ios

# 既存 ios/ ディレクトリを削除（あれば）
rm -rf ios/

# Expo prebuild（iOS のみ、クリーン）
pnpm expo prebuild --platform ios --clean
```

prebuild が成功したら `ios/Pods/` に `@tursodatabase/sync-react-native` 関連ネイティブが含まれることを確認:

```bash
ls ios/Pods/ | grep -i turso
# 期待値: TursoDatabaseSyncReactNative または同様のディレクトリ名（パッケージ実装に依存）

# あるいは Podfile.lock で確認
grep -i "turso\|sync-react-native" ios/Podfile.lock | head -5
```

確認:
- [ ] `pnpm expo prebuild --platform ios --clean` が成功し、`ios/` ディレクトリが生成されること
- [ ] `ios/Pods/` に Turso 関連ネイティブモジュールがリンクされていること
- [ ] `pnpm expo run:ios` または Xcode 経由で Dev Build がビルドされ、シミュレータ／実機で起動できること

ビルド・起動コマンド（シミュレータの例）:

```bash
pnpm expo run:ios --device  # 実機選択ダイアログが出る
# あるいは
pnpm expo run:ios            # デフォルトのシミュレータで起動
```

ビルド失敗のよくある原因:
- CocoaPods キャッシュが古い: `cd ios && pod deintegrate && pod install`
- Hermes 関連エラー: `app.json` の `jsEngine` を確認（既存設定を変えない）
- New Architecture 未有効: `@tursodatabase/sync-react-native` は New Architecture 必須。`app.json` の `newArchEnabled: true` を確認

---

## STEP 2: アプリ起動 + ログイン（4.1.3 connect 部分 + 4.4.2 初回 pull）

アプリが起動したら、Google サインインでログインする。

確認:
- [ ] サインイン画面が表示され、Google ログインボタンが反応すること
- [ ] ログイン成功後、ホーム画面が表示されること（ローディングインジケータ → ホーム）
- [ ] ホーム画面のタイトル「ようこそ！」とユーザー名・メールアドレスが表示されること
- [ ] FlatList の上に「Embedded Replicas テスト (X件)」と表示されること（X は既存の programs 件数）
- [ ] Metro bundler のコンソールに `error` ログが出ていないこと

裏側で起きていること:
- `database.ts` の `initializeDatabase()` が呼ばれ、`@tursodatabase/sync-react-native` の `connect({ path, url, authToken })` で sync database が確立
- `applyMigrationsToSyncReactNative` でマイグレーション 4 件適用（初回起動時）
- `DatabaseProvider` の初回 `pull()` がバックグラウンドで実行される

トラブルシューティング:
- ローディングインジケータから進まない場合: Metro コンソールでエラー確認。`Native module not found` なら STEP 1 の Pods が正しくリンクされていない
- ログイン後にクラッシュする場合: `JSI bindings not found` → New Architecture 未有効

---

## STEP 3: 書き込み即 push（4.1.3 push 部分 + 4.5.1）

ホーム画面で「追加」ボタンをタップ → 一覧に新規アイテムが現れる。

確認:
- [ ] 「追加」タップ → アイテムが一覧に増えること（ローカル書き込み成功）
- [ ] Metro コンソールに `追加後の push に失敗しました` 等の警告が出ないこと
- [ ] **Web 側**で確認: Turso ダッシュボード（または `https://app.turso.tech/`）の Per-User DB に対し、`programs` テーブルを SELECT して新規行が反映されていること

```sql
-- Turso ダッシュボード or libsql shell で
SELECT id, name, created_at FROM programs ORDER BY created_at DESC LIMIT 5;
```

オプション: 圏外でも書き込みは可能であることの確認（4.5.1 の追加完了条件）:
- [ ] iPhone を機内モードに → 「追加」 → ローカル一覧には反映される（push は失敗するが警告のみ）
- [ ] 機内モード解除 → 「Pull」ボタン または アプリをバックグラウンド → 復帰 → 自動 push が走る → Web 側で反映確認

---

## STEP 4: Pull ボタン + AppState 'active' での pull（4.6.1）

### 4-A: Pull ボタンによる手動 pull

Web 側でデータを 1 件追加する（Turso ダッシュボードで INSERT）:

```sql
INSERT INTO programs (id, name, meta_info, created_at, updated_at)
VALUES ('test-from-web-1', 'Web から追加', NULL, strftime('%s','now')*1000, strftime('%s','now')*1000);
```

iOS 側でホーム画面の「Pull」ボタンをタップ。

確認:
- [ ] 「同期中...」 → 「同期完了 HH:MM:SS」と表示されること
- [ ] 一覧に「Web から追加」が現れること

### 4-B: AppState 'active' 遷移での自動 pull

Web 側でさらに 1 件追加:

```sql
INSERT INTO programs (id, name, meta_info, created_at, updated_at)
VALUES ('test-from-web-2', 'AppState テスト', NULL, strftime('%s','now')*1000, strftime('%s','now')*1000);
```

iOS 側で:
1. アプリをバックグラウンドに（ホームボタン or スワイプアップ）
2. 何か別のアプリを開く（数秒）
3. アプリに戻る

確認:
- [ ] アプリ復帰後、自動的に一覧が更新され「AppState テスト」が現れる、または「再読込」ボタンで現れること（pull は走るが UI 更新は再読込が必要な場合がある）
- [ ] Metro コンソールに `AppState 'active' での pull に失敗` 等の警告が出ないこと

注: pull は AppState 復帰で走るが、画面の `setState` は明示的に再 read しないと反映されない。実装上は `loadItems()` を AppState pull 後に自動呼び出ししていないため、「再読込」ボタンで反映する。これは設計通り（pull はデータ取得、UI 更新は別ライフサイクル）。

---

## STEP 5: PRAGMA foreign_keys 確認（4.7.1）

実機で FK 違反操作（親レコード DELETE で NO ACTION 違反）が想定通りエラーになるか確認する。`days` テーブルは `programs.id` への FK を持つ。

`apps/ios/src/components/home-screen.tsx` に**一時的に**以下のデバッグボタンを追加する:

```tsx
// import 追加
import { days, programs } from "@next-lift/per-user-database/database-schemas";
import { generateId } from "@next-lift/utilities/generate-id";
import { sql } from "drizzle-orm";

// HomeScreen 関数内に追加
const handleFkTest = async () => {
	try {
		// 0. FK が ON か確認
		const pragmaResult = await db.all(sql`PRAGMA foreign_keys`);
		console.log("[FK TEST] PRAGMA foreign_keys =", pragmaResult);

		// 1. テスト用 program と day を作成
		const programId = generateId();
		await db.insert(programs).values({
			id: programId,
			name: "FK テスト用",
			metaInfo: null,
		});
		const dayId = generateId();
		await db.insert(days).values({
			id: dayId,
			programId,
			label: "Day 1",
			displayOrder: 1,
			metaInfo: null,
		});

		// 2. 親 program を削除しようとする → FK 違反で失敗するはず
		try {
			await db.delete(programs).where(eq(programs.id, programId));
			Alert.alert("FK TEST 失敗", "削除が成功してしまいました（FK が効いていない）");
		} catch (e) {
			console.log("[FK TEST] 期待通り FK 違反:", e);
			Alert.alert(
				"FK TEST 成功",
				`FK 違反で削除が拒否されました: ${e instanceof Error ? e.message : String(e)}`,
			);
		}

		// 3. 後始末（day → program の順で削除）
		await db.delete(days).where(eq(days.id, dayId));
		await db.delete(programs).where(eq(programs.id, programId));
		await loadItems();
	} catch (e) {
		console.error("[FK TEST] セットアップエラー:", e);
		Alert.alert("FK TEST エラー", String(e));
	}
};
```

JSX 内の `<View style={styles.buttonRow}>` にボタン追加:

```tsx
<Pressable
	style={[styles.syncButton, { backgroundColor: "#f59e0b" }]}
	onPress={handleFkTest}
>
	<Text style={styles.syncButtonText}>FK Test</Text>
</Pressable>
```

ホットリロード or 再起動して「FK Test」ボタンをタップ。

確認:
- [ ] Metro コンソールに `[FK TEST] PRAGMA foreign_keys = [{foreign_keys: 1}]`（または同等）が出ること（FK が ON）
- [ ] アラートに「FK TEST 成功」と表示され、エラーメッセージに `FOREIGN KEY constraint failed` または同等が含まれること

完了後、デバッグコードは**コミットせずに削除**する（git stash / git checkout で元に戻す）。

---

## STEP 6: drizzle 経由 raw SQL 取得確認（4.1.4）

旧 op-sqlite では `db.all(sql`...`)` の結果が空になるバグがあった（`.claude/rules/op-sqlite-raw-sql.md` 参照）。新ドライバーで解消されているか確認。

STEP 5 のデバッグボタンと同じ要領で、別のデバッグボタンを追加:

```tsx
const handleRawSqlTest = async () => {
	try {
		// 1. 数値リテラル
		const r1 = await db.all(sql`SELECT 1 AS one, 2 AS two`);
		console.log("[RAW SQL] result1:", r1);

		// 2. 既存テーブル COUNT
		const r2 = await db.all(sql`SELECT COUNT(*) AS count FROM programs`);
		console.log("[RAW SQL] result2:", r2);

		Alert.alert(
			"RAW SQL TEST",
			`r1: ${JSON.stringify(r1)}\nr2: ${JSON.stringify(r2)}`,
		);
	} catch (e) {
		console.error("[RAW SQL TEST] エラー:", e);
		Alert.alert("RAW SQL TEST エラー", String(e));
	}
};
```

ボタン追加:

```tsx
<Pressable
	style={[styles.syncButton, { backgroundColor: "#06b6d4" }]}
	onPress={handleRawSqlTest}
>
	<Text style={styles.syncButtonText}>Raw SQL</Text>
</Pressable>
```

確認:
- [ ] アラートで `r1` が `[{"one":1,"two":2}]`（または `[[1,2]]` 形式）として表示されること（**空配列でない**）
- [ ] `r2` が `[{"count":N}]` の形式で N が programs 件数と一致すること

完了後、デバッグコードは削除する。

---

## STEP 7: トランザクション ROLLBACK（4.2.2）

トランザクション内エラー時に ROLLBACK されることを確認する。同じ要領で一時デバッグボタンを追加:

```tsx
const handleTxRollbackTest = async () => {
	try {
		const beforeCount = (await db.select().from(programs)).length;

		try {
			await db.transaction(async (tx) => {
				await tx.insert(programs).values({
					id: "rollback-test-1",
					name: "ROLLBACK されるはず",
					metaInfo: null,
				});
				throw new Error("意図的なロールバック");
			});
		} catch (e) {
			console.log("[TX ROLLBACK] 期待通りエラー:", e);
		}

		const afterCount = (await db.select().from(programs)).length;
		const exists = await db
			.select()
			.from(programs)
			.where(eq(programs.id, "rollback-test-1"));

		const result =
			beforeCount === afterCount && exists.length === 0
				? "成功: ROLLBACK され副作用が残っていない"
				: `失敗: before=${beforeCount} after=${afterCount} exists=${exists.length}`;

		Alert.alert("TX ROLLBACK TEST", result);
		console.log("[TX ROLLBACK]", result);
	} catch (e) {
		console.error("[TX ROLLBACK TEST] エラー:", e);
		Alert.alert("TX ROLLBACK TEST エラー", String(e));
	}
};
```

ボタン追加:

```tsx
<Pressable
	style={[styles.syncButton, { backgroundColor: "#ec4899" }]}
	onPress={handleTxRollbackTest}
>
	<Text style={styles.syncButtonText}>TX Test</Text>
</Pressable>
```

確認:
- [ ] アラートに「成功: ROLLBACK され副作用が残っていない」が表示されること
- [ ] 一覧に「ROLLBACK されるはず」が出ていないこと

完了後、デバッグコードは削除する。

---

## STEP 8: E2E（4.8.1）+ コンフリクト（4.8.2）

### 8-A: 書き込み即 push + ライフサイクル pull の E2E（4.8.1）

シナリオ: プログラム作成 → push 反映 → アプリ閉じ → 再開で pull → Web 編集 → ホーム再入で反映

1. iOS アプリで「追加」 → 1 件追加
2. Web 側（Turso ダッシュボード）で `programs` を SELECT → 新規行が見えること
3. iOS アプリを完全に閉じる（タスクスワイプで終了）
4. Web 側で `UPDATE programs SET name = 'Web で更新' WHERE id = '<さっきの ID>';`
5. iOS アプリを再起動 → ログイン状態で起動 → 自動で初回 pull が走る → 一覧に「Web で更新」が反映されること（再読込ボタンで明示的に再 read してもよい）

確認:
- [ ] 上記シナリオが成功すること
- [ ] アプリ再起動時のローディング → ホーム画面で Web の更新が見えること

### 8-B: コンフリクト動作（last push wins, 4.8.2）

同一レコードを Web と iOS で同時編集 → 両方 push → 後勝ち。

1. iOS で 1 件追加（id を控える、例: `conflict-test-1`、name: `iOS 初期`）
2. iOS の状態で Web 側に push が反映されたことを確認
3. **iOS をオフライン（機内モード）**にする
4. iOS で同レコードに対して何か書き込み（例: 削除 → 同 id で再追加 with `name: "iOS 後発"`）
5. Web 側で同 id の name を `Web 後発` に UPDATE → push（Web は即座にクラウド反映）
6. iOS の機内モード解除 → AppState 復帰 → iOS の push が走る

注: 現在の home-screen UI には「name 編集」機能がないので、削除 → 同 id 再追加で代替する。あるいは、Turso ダッシュボードからの編集と iOS の手動「追加」（別 id）で擬似的に確認することもできる。

確認:
- [ ] 最終的に Turso クラウド上の name が、後で push された側の値（=iOS から `iOS 後発`）になること
- [ ] iOS 側で Pull すると、Web 側の `Web 後発` ではなく自身の `iOS 後発` が見えること（last push wins）

このシナリオが成り立たない場合（例: Turso 側のコンフリクト解決が異なる）、breakdown のラウンド10 として動作差分を記録する。

---

## 完了後のアクション

すべての STEP がパスしたら:

1. `apps/ios/src/components/home-screen.tsx` から STEP 5/6/7 で追加したデバッグコードを削除（git diff で確認、不要差分があれば `git checkout -- apps/ios/src/components/home-screen.tsx`）
2. PR #736 のチェックリストにチェックを入れる
3. PR を「Ready for review」に変更
4. レビュー依頼

確認漏れがある場合は、breakdown の該当タスクを `[ ]` のままにしておき、PR 本文に明記する。

## トラブルシューティング

### `Native module not found` エラー
- `cd apps/ios/ios && pod deintegrate && pod install` を実行
- Xcode から Clean Build Folder（Cmd+Shift+K）

### `JSI bindings not found` エラー
- New Architecture が無効化されている。`apps/ios/app.json` の `newArchEnabled: true` を確認
- 旧設定が残っていれば `expo prebuild --clean` で再生成

### push / pull が常に失敗する
- `apps/ios/src/lib/credentials.ts` の credentials 取得経路を確認（authToken が空 or 期限切れ）
- Web 側でログイン状態を確認 → iOS 側で一度サインアウト → 再ログイン

### マイグレーションエラー
- 開発端末のシミュレータをリセット（iOS Simulator → Device → Erase All Content and Settings）
- 実機の場合: アプリを長押し → 削除 → 再インストール
