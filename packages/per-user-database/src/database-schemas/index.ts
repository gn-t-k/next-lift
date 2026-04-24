import { days } from "./days";
import { exerciseLogs } from "./exercise-logs";
import { exercisePlanExercises } from "./exercise-plan-exercises";
import { exercisePlans } from "./exercise-plans";
import { exercises } from "./exercises";
import { oneRepMaxes } from "./one-rep-maxes";
import { programs } from "./programs";
import { repsRpeParams } from "./reps-rpe-params";
import { setLogs } from "./set-logs";
import { setPlans } from "./set-plans";
import { weightRepsParams } from "./weight-reps-params";
import { weightRpeParams } from "./weight-rpe-params";
import { workoutCompletions } from "./workout-completions";
import { workoutDayLinks } from "./workout-day-links";
import { workouts } from "./workouts";

export { days } from "./days";
export { exerciseLogs } from "./exercise-logs";
export { exercisePlanExercises } from "./exercise-plan-exercises";
export { exercisePlans } from "./exercise-plans";
export { exercises } from "./exercises";
export { oneRepMaxes } from "./one-rep-maxes";
export { programs } from "./programs";
export { repsRpeParams } from "./reps-rpe-params";
export { setLogs } from "./set-logs";
export { setPlans } from "./set-plans";
export { weightRepsParams } from "./weight-reps-params";
export { weightRpeParams } from "./weight-rpe-params";
export { workoutCompletions } from "./workout-completions";
export { workoutDayLinks } from "./workout-day-links";
export { workouts } from "./workouts";

export const schema = {
	programs,
	days,
	exercisePlans,
	exercisePlanExercises,
	setPlans,
	weightRepsParams,
	weightRpeParams,
	repsRpeParams,
	exercises,
	oneRepMaxes,
	workouts,
	workoutDayLinks,
	workoutCompletions,
	exerciseLogs,
	setLogs,
} as const;
