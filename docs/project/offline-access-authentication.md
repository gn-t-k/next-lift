# オフライン時の認証アクセスに関する要望・要求の整理

## 背景

Next Liftはジムでの利用を前提としたトレーニング記録アプリであり、電波の悪い環境でもトレーニング計画の参照・記録ができる必要がある（ADR-010: Local-first Architecture）。

Turso Embedded Replicas（op-sqlite）によるローカルDBのオフラインアクセスは実装済みだが、**「認証が必要なアプリにおいて、オフライン時にアプリを利用できるか」** という問題が未検討だった。

## 結論

**現在の実装には3つのオフラインブロッキングポイントが存在し、オフラインではアプリを利用できない。** 設計・実装の追加が必要。

## 現在の認証の仕組み

### アプリ起動フロー

```
App.tsx
├── useSession() でセッション確認
│   ├── isPending → ローディング表示
│   ├── session == null → SignInScreen表示  ← ゲート1
│   └── session != null → DatabaseProvider
│       └── initializeDatabase()
│           ├── resolveCredentials()  ← ゲート2
│           │   ├── キャッシュあり + 有効期限内 → キャッシュ返却
│           │   └── キャッシュなし or 期限切れ → API呼び出し（ネットワーク必要）
│           ├── openSync() でローカルDB + リモート同期設定
│           ├── sqlite.sync()  ← ゲート3（リモート同期）
│           ├── drizzle + migrate
│           └── DB初期化完了 → HomeScreen表示
```

### 関連する技術スタック

| レイヤー | 技術 | 保存場所 |
|---------|------|---------|
| 認証 | Better Auth + @better-auth/expo | セッション: expo-secure-store |
| DBクレデンシャル | authClient.getCredentials() | キャッシュ: expo-secure-store |
| ローカルDB | op-sqlite (Turso Embedded Replicas) | ファイル: per-user.sqlite |
| リモート同期 | libsql sync (60秒間隔) | Turso Cloud |

### 認証セッションの保存

Better Authの`@better-auth/expo`プラグインは、セッション情報を`expo-secure-store`にキャッシュする（`next-lift`プレフィックス）。起動時にキャッシュからセッションを即座に返し、ローディングスピナーを不要にする仕組み。

### Per-User DBクレデンシャルの保存

Turso Per-User DBへの接続情報（URL, authToken, expiresAt）も`expo-secure-store`にキャッシュされる（キー: `next-lift-per-user-db-credentials`）。authTokenの有効期限は30日（ADR-020）。

## 問題の詳細

### 問題1: `useSession()`がオフラインでセッションを`null`にする

**影響ファイル**: `apps/ios/App.tsx`

Better Authの`useSession()`は2つのことを行う:

1. SecureStoreからキャッシュされたセッションを**即座に**返す（Expoプラグインの機能）
2. サーバーに`GET /api/auth/get-session`リクエストを送り、セッションを検証する

問題は、ステップ2がオフラインで失敗したときの挙動にある。Better Authの内部実装（`query.ts`の`onError`ハンドラ）は、**フェッチ失敗時に`data: null`をセットする**:

```typescript
// better-auth内部のonErrorハンドラ（query.ts）
value.set({
  error: context.error,
  data: null,        // ← キャッシュされたセッションがnullで上書きされる
  isPending: false,
  isRefetching: false,
  refetch: value.value.refetch,
});
```

この結果、App.tsxの`session == null`チェックに到達し、**認証済みユーザーでもオフラインではSignInScreenが表示される**。

Better Authのコミュニティでもこの問題は認識されており、オフラインサポートに関する議論がGitHubで行われている。

### 問題2: DBクレデンシャルの期限切れ時にネットワークが必須

**影響ファイル**: `apps/ios/src/lib/credentials.ts`

```typescript
export const resolveCredentials = async (): Promise<Credentials> => {
  const cached = getCredentials();
  if (cached != null && !isExpired(cached.expiresAt)) {
    return cached;  // キャッシュが有効ならOK
  }
  const credentials = await fetchCredentials();  // ← オフラインで失敗
  // ...
};
```

Per-User DBのauthToken（30日有効、ADR-020）が期限切れの場合、APIからの再取得が必要。オフラインではこのAPI呼び出しが失敗し、エラーがスローされる。

ただし、authTokenが必要なのは**リモートDBとの同期のみ**。ローカルSQLiteファイルへの読み書きにはauthTokenは不要。

### 問題3: `sqlite.sync()`の失敗がDB初期化全体をブロック

**影響ファイル**: `apps/ios/src/lib/database.ts`

```typescript
export const initializeDatabase = async () => {
  const credentials = await resolveCredentials();
  const sqlite = openSync({ /* ... */ });
  sqlite.sync();  // ← オフラインで例外が発生する可能性
  // ...
};
```

`initializeDatabase`内の`sqlite.sync()`がオフラインで失敗すると、`database-context.tsx`の`withRetry`が3回リトライした後にエラーをスロー。`DatabaseProvider`がエラーをスローし、アプリが使用不能になる。

## 対応方針

### 前提

- オフラインアクセスは **「一度でもオンラインで認証・同期済みのユーザー」** に限定する
- 初回サインインにはネットワーク接続が必須
- オフライン時はローカルDBへの読み書きのみ行い、オンライン復帰後に同期する

### 対応1: セッション管理のオフライン対応

Better Authの`useSession()`をラップするカスタムフック`useOfflineAwareSession`を作成する。

**方針**:

1. `useSession()`の結果を監視
2. セッションが正常に取得できた場合 → セッション情報をSecureStoreに独自にキャッシュ
3. `useSession()`がエラーを返した場合 → `expo-network`でネットワーク状態を確認
   - オフライン + キャッシュあり → **キャッシュされたセッションを返す**（オフラインアクセス許可）
   - オンライン + エラー → `null`を返す（セッション無効 = 再認証が必要）
   - オフライン + キャッシュなし → `null`を返す（初回利用 = オフラインでは不可）
4. `App.tsx`で`useSession`を`useOfflineAwareSession`に差し替え

**必要なファイル**:

| ファイル | 変更 |
|---------|------|
| `apps/ios/src/lib/network-status.ts` | 新規: `expo-network`によるネットワーク状態検出 |
| `apps/ios/src/lib/use-offline-aware-session.ts` | 新規: カスタムフック |
| `apps/ios/App.tsx` | 変更: `useSession` → `useOfflineAwareSession` |

### 対応2: クレデンシャル解決のオフライン対応

オフライン時は期限切れのクレデンシャルでも返すように`resolveCredentials`を変更する。

**根拠**:

- `authToken`はリモートDBとの同期（`sync()`）にのみ必要
- オフライン時はそもそも同期不可能なので、期限切れトークンでも問題ない
- `openSync()`でローカルDBファイルを開く際にトークンの有効性は検証されない

**必要なファイル**:

| ファイル | 変更 |
|---------|------|
| `apps/ios/src/lib/credentials.ts` | 変更: オフライン + 期限切れキャッシュ → キャッシュを返す |

### 対応3: DB初期化のオフライン対応

`sqlite.sync()`の失敗をキャッチし、オフラインでもローカルDBを使い続けられるようにする。

**必要なファイル**:

| ファイル | 変更 |
|---------|------|
| `apps/ios/src/lib/database.ts` | 変更: `sync()`をtry-catchで囲む |

### 対応4: ネットワーク状態検出ユーティリティ

`expo-network`（既にインストール済み）を使い、オンライン/オフラインの判定を行うユーティリティを作成する。対応1・対応2で共用。

### ADR記録

実装完了後、オフラインアクセス時の認証方針をADRとして記録する。主な決定事項:

- オフラインアクセスは「一度以上オンラインで認証・同期済み」のユーザーに限定
- セッションはローカルにキャッシュし、オフライン時はキャッシュを信頼する
- DBトークンの期限切れはオフライン時に無視する（ローカルアクセスに影響しないため）
- セキュリティリスクの許容: デバイスに物理アクセスできる攻撃者はSecureStoreのデータにもアクセスできる可能性があるが、Per-User DBパターンにより他ユーザーのデータは保護される

## セキュリティ上の考慮事項

### 許容するリスク

- **デバイス紛失時のデータ露出**: expo-secure-storeはiOSのKeychainを使用しており、デバイスロック（生体認証/パスコード）で保護される
- **セッションの有効性確認のスキップ**: オフライン時はサーバー側のセッション無効化（ログアウト、アカウント削除）を検知できない。オンライン復帰時に再検証する

### 軽減策

- オンライン復帰時にセッションを再検証する（Better Authの通常フロー）
- Per-User DBパターンにより、仮にセッションが不正利用されても影響は当該ユーザーのデータのみに限定される

## 検証方法

### テストコード

1. **`network-status.test.ts`**: `expo-network`をモックしてオンライン/オフライン判定をテスト
2. **`use-offline-aware-session.test.ts`**:
   - オンライン + セッションあり → セッションを返すこと
   - オフライン + キャッシュあり → キャッシュを返すこと
   - オンライン + エラー → nullを返すこと（再認証必要）
   - オフライン + キャッシュなし → nullを返すこと（初回利用 = オフライン不可）
3. **`credentials.test.ts`**（既存テストに追加）:
   - オフライン + 期限切れキャッシュ → キャッシュを返すこと
   - オフライン + キャッシュなし → エラーになること
4. **`database.test.ts`**: sync失敗時もDB初期化が完了すること

### 手動確認

- 機内モードでアプリを起動し、ホーム画面が表示されること
- オフラインでデータの読み取りができること
- オンライン復帰後にsyncが正常に行われること

## 参考リンク

- [Better Auth Expo Integration](https://www.better-auth.com/docs/integrations/expo)
- [Better Auth query.ts (onError handler)](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/client/query.ts)
- [Better Auth Expo client plugin source](https://github.com/better-auth/better-auth/blob/main/packages/expo/src/client.ts)
- [Better Auth session-atom.ts](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/client/session-atom.ts)
- [Offline support discussion (Better Auth community)](https://www.answeroverflow.com/m/1366745943193554975)
- [OP-SQLite libsql Getting Started](https://op-engineering.github.io/op-sqlite/docs/Libsql/start/)
- [Turso Embedded Replicas](https://docs.turso.tech/features/embedded-replicas/introduction)
