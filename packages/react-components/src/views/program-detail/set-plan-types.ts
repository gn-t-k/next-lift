export type Pattern = "weight-x-reps" | "weight-x-rpe" | "reps-x-rpe";

export type SetPlanWithParams =
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

export type SetPlan = { id: string } & (SetPlanWithParams | { pattern: null });

// 重量の単位。本来は Exercise の属性だが、現状 Exercise 型の抽出は不要なので
// SetPlan 関連の型置き場である本ファイルに置く。将来 Exercise 型を分離する
// 際は exercise-types.ts などへ移動する。
export type WeightUnit = "kg" | "lbs";
