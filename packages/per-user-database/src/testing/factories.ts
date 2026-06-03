import { composeFactory } from "@praha/drizzle-factory";
import { daysFactory } from "../database-schemas/days/days-factory";
import { exerciseLogsFactory } from "../database-schemas/exercise-logs/exercise-logs-factory";
import { exercisePlanExercisesFactory } from "../database-schemas/exercise-plan-exercises/exercise-plan-exercises-factory";
import { exercisePlansFactory } from "../database-schemas/exercise-plans/exercise-plans-factory";
import { exercisesFactory } from "../database-schemas/exercises/exercises-factory";
import { oneRepMaxesFactory } from "../database-schemas/one-rep-maxes/one-rep-maxes-factory";
import { programsFactory } from "../database-schemas/programs/programs-factory";
import { repsRpeParamsFactory } from "../database-schemas/reps-rpe-params/reps-rpe-params-factory";
import { setLogsFactory } from "../database-schemas/set-logs/set-logs-factory";
import { setPlansFactory } from "../database-schemas/set-plans/set-plans-factory";
import { weightRepsParamsFactory } from "../database-schemas/weight-reps-params/weight-reps-params-factory";
import { weightRpeParamsFactory } from "../database-schemas/weight-rpe-params/weight-rpe-params-factory";
import { workoutCompletionsFactory } from "../database-schemas/workout-completions/workout-completions-factory";
import { workoutDayLinksFactory } from "../database-schemas/workout-day-links/workout-day-links-factory";
import { workoutsFactory } from "../database-schemas/workouts/workouts-factory";

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
