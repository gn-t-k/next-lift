import { days } from "./days/days";
import { exerciseLogs } from "./exercise-logs/exercise-logs";
import { exercisePlanExercises } from "./exercise-plan-exercises/exercise-plan-exercises";
import { exercisePlans } from "./exercise-plans/exercise-plans";
import { exercises } from "./exercises/exercises";
import { oneRepMaxes } from "./one-rep-maxes/one-rep-maxes";
import { programs } from "./programs/programs";
import { repsRpeParams } from "./reps-rpe-params/reps-rpe-params";
import { setLogs } from "./set-logs/set-logs";
import { setPlans } from "./set-plans/set-plans";
import { weightRepsParams } from "./weight-reps-params/weight-reps-params";
import { weightRpeParams } from "./weight-rpe-params/weight-rpe-params";
import { workoutCompletions } from "./workout-completions/workout-completions";
import { workoutDayLinks } from "./workout-day-links/workout-day-links";
import { workouts } from "./workouts/workouts";

export { days } from "./days/days";
export { exerciseLogs } from "./exercise-logs/exercise-logs";
export { exercisePlanExercises } from "./exercise-plan-exercises/exercise-plan-exercises";
export { exercisePlans } from "./exercise-plans/exercise-plans";
export { exercises } from "./exercises/exercises";
export { oneRepMaxes } from "./one-rep-maxes/one-rep-maxes";
export { programs } from "./programs/programs";
export { repsRpeParams } from "./reps-rpe-params/reps-rpe-params";
export { setLogs } from "./set-logs/set-logs";
export { setPlans } from "./set-plans/set-plans";
export { weightRepsParams } from "./weight-reps-params/weight-reps-params";
export { weightRpeParams } from "./weight-rpe-params/weight-rpe-params";
export { workoutCompletions } from "./workout-completions/workout-completions";
export { workoutDayLinks } from "./workout-day-links/workout-day-links";
export { workouts } from "./workouts/workouts";

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
