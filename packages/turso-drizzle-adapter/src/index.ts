// 共通型のみを露出する root エントリ。実装は `./serverless`（Web 用）/ `./database`（Node 用）のドライバ別サブパスに分離している。詳細は CLAUDE.md
export type { SqliteRunResult } from "./sqlite-run-result";
