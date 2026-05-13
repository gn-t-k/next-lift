export type Pattern = "weight-x-reps" | "weight-x-rpe" | "reps-x-rpe";

export type SetPlanWithParams =
	| { pattern: "weight-x-reps"; weight: number; reps: number }
	| { pattern: "weight-x-rpe"; weight: number; rpe: number }
	| { pattern: "reps-x-rpe"; reps: number; rpe: number };

export type SetPlan = { id: string } & (SetPlanWithParams | { pattern: null });
