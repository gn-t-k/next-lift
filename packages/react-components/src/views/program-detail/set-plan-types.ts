export type SetPlan =
	| { id: string; pattern: "weight-reps"; weight: number; reps: number }
	| { id: string; pattern: "weight-rpe"; weight: number; rpe: number }
	| { id: string; pattern: "reps-rpe"; reps: number; rpe: number };

// まだ永続化されていないためidを持たないセット計画
export type SetPlanDraft = DistributiveOmit<SetPlan, "id">;

type DistributiveOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never;
