import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { exercises } from "./exercises";

/**
 * イベント化テーブル（INSERT only）。最新レコード（registered_at DESC LIMIT 1）が「現在の1RM」。
 * achieved_at はユーザー入力（推移グラフのX軸）、registered_at はシステム自動設定。
 * weight_kg は常にkg単位。weight_input_unit: "kg" | "lbs" （アプリ側定数で管理）
 */
export const oneRepMaxes = sqliteTable(
	"one_rep_maxes",
	{
		id: text("id").primaryKey(),
		exerciseId: text("exercise_id")
			.notNull()
			.references(() => exercises.id),
		weightKg: real("weight_kg").notNull(),
		weightInputUnit: text("weight_input_unit").notNull(),
		achievedAt: integer("achieved_at", { mode: "timestamp_ms" }).notNull(),
		registeredAt: integer("registered_at", { mode: "timestamp_ms" }).notNull(),
	},
	(table) => [index("one_rep_maxes_exercise_id_idx").on(table.exerciseId)],
);
