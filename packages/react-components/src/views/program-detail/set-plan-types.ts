export type Pattern = "weight-reps" | "weight-rpe" | "reps-rpe";

export type SetPlanWithParams =
	| { pattern: "weight-reps"; weight: number; reps: number }
	| { pattern: "weight-rpe"; weight: number; rpe: number }
	| { pattern: "reps-rpe"; reps: number; rpe: number };

export type SetPlan = { id: string } & SetPlanWithParams;

// 重量の単位。本来は Exercise の属性だが、現状 Exercise 型の抽出は不要なので
// SetPlan 関連の型置き場である本ファイルに置く。将来 Exercise 型を分離する
// 際は exercise-types.ts などへ移動する。
export type WeightUnit = "kg" | "lbs";
