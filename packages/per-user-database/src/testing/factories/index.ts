import { composeFactory } from "@praha/drizzle-factory";
import { daysFactory } from "./days-factory";
import { exerciseLogsFactory } from "./exercise-logs-factory";
import { exercisePlanExercisesFactory } from "./exercise-plan-exercises-factory";
import { exercisePlansFactory } from "./exercise-plans-factory";
import { exercisesFactory } from "./exercises-factory";
import { oneRepMaxesFactory } from "./one-rep-maxes-factory";
import { programsFactory } from "./programs-factory";
import { repsRpeParamsFactory } from "./reps-rpe-params-factory";
import { setLogsFactory } from "./set-logs-factory";
import { setPlansFactory } from "./set-plans-factory";
import { weightRepsParamsFactory } from "./weight-reps-params-factory";
import { weightRpeParamsFactory } from "./weight-rpe-params-factory";
import { workoutCompletionsFactory } from "./workout-completions-factory";
import { workoutDayLinksFactory } from "./workout-day-links-factory";
import { workoutsFactory } from "./workouts-factory";

export const factories = composeFactory({
	programs: programsFactory,
	days: daysFactory,
	exercisePlans: exercisePlansFactory,
	exercisePlanExercises: exercisePlanExercisesFactory,
	setPlans: setPlansFactory,
	weightRepsParams: weightRepsParamsFactory,
	weightRpeParams: weightRpeParamsFactory,
	repsRpeParams: repsRpeParamsFactory,
	exercises: exercisesFactory,
	oneRepMaxes: oneRepMaxesFactory,
	workouts: workoutsFactory,
	workoutDayLinks: workoutDayLinksFactory,
	workoutCompletions: workoutCompletionsFactory,
	exerciseLogs: exerciseLogsFactory,
	setLogs: setLogsFactory,
});
