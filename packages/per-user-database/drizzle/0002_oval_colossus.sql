PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_days` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`label` text NOT NULL,
	`display_order` integer NOT NULL,
	`meta_info` text,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "days_label_length_check" CHECK(length("__new_days"."label") BETWEEN 1 AND 200),
	CONSTRAINT "days_meta_info_length_check" CHECK("__new_days"."meta_info" IS NULL OR length("__new_days"."meta_info") BETWEEN 1 AND 10000),
	CONSTRAINT "days_display_order_check" CHECK("__new_days"."display_order" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_days`("id", "program_id", "label", "display_order", "meta_info") SELECT "id", "program_id", "label", "display_order", "meta_info" FROM `days`;--> statement-breakpoint
DROP TABLE `days`;--> statement-breakpoint
ALTER TABLE `__new_days` RENAME TO `days`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `days_program_id_idx` ON `days` (`program_id`);--> statement-breakpoint
CREATE TABLE `__new_exercise_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`memo` text,
	`display_order` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "exercise_logs_memo_length_check" CHECK("__new_exercise_logs"."memo" IS NULL OR length("__new_exercise_logs"."memo") BETWEEN 1 AND 10000),
	CONSTRAINT "exercise_logs_display_order_check" CHECK("__new_exercise_logs"."display_order" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_exercise_logs`("id", "workout_id", "exercise_id", "memo", "display_order") SELECT "id", "workout_id", "exercise_id", "memo", "display_order" FROM `exercise_logs`;--> statement-breakpoint
DROP TABLE `exercise_logs`;--> statement-breakpoint
ALTER TABLE `__new_exercise_logs` RENAME TO `exercise_logs`;--> statement-breakpoint
CREATE INDEX `exercise_logs_workout_id_idx` ON `exercise_logs` (`workout_id`);--> statement-breakpoint
CREATE INDEX `exercise_logs_exercise_id_idx` ON `exercise_logs` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `__new_exercise_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`display_order` integer NOT NULL,
	`meta_info` text,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "exercise_plans_meta_info_length_check" CHECK("__new_exercise_plans"."meta_info" IS NULL OR length("__new_exercise_plans"."meta_info") BETWEEN 1 AND 10000),
	CONSTRAINT "exercise_plans_display_order_check" CHECK("__new_exercise_plans"."display_order" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_exercise_plans`("id", "day_id", "display_order", "meta_info") SELECT "id", "day_id", "display_order", "meta_info" FROM `exercise_plans`;--> statement-breakpoint
DROP TABLE `exercise_plans`;--> statement-breakpoint
ALTER TABLE `__new_exercise_plans` RENAME TO `exercise_plans`;--> statement-breakpoint
CREATE INDEX `exercise_plans_day_id_idx` ON `exercise_plans` (`day_id`);--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`default_weight_input_unit` text DEFAULT 'kg' NOT NULL,
	CONSTRAINT "exercises_name_length_check" CHECK(length("__new_exercises"."name") BETWEEN 1 AND 200)
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "name", "default_weight_input_unit") SELECT "id", "name", "default_weight_input_unit" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
CREATE TABLE `__new_one_rep_maxes` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`weight_kg` real NOT NULL,
	`weight_input_unit` text NOT NULL,
	`achieved_at` integer NOT NULL,
	`registered_at` integer NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "one_rep_maxes_weight_kg_check" CHECK("__new_one_rep_maxes"."weight_kg" > 0),
	CONSTRAINT "one_rep_maxes_achieved_before_registered_check" CHECK("__new_one_rep_maxes"."achieved_at" <= "__new_one_rep_maxes"."registered_at")
);
--> statement-breakpoint
INSERT INTO `__new_one_rep_maxes`("id", "exercise_id", "weight_kg", "weight_input_unit", "achieved_at", "registered_at") SELECT "id", "exercise_id", "weight_kg", "weight_input_unit", "achieved_at", "registered_at" FROM `one_rep_maxes`;--> statement-breakpoint
DROP TABLE `one_rep_maxes`;--> statement-breakpoint
ALTER TABLE `__new_one_rep_maxes` RENAME TO `one_rep_maxes`;--> statement-breakpoint
CREATE INDEX `one_rep_maxes_exercise_id_idx` ON `one_rep_maxes` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `__new_programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`meta_info` text,
	CONSTRAINT "programs_name_length_check" CHECK(length("__new_programs"."name") BETWEEN 1 AND 200),
	CONSTRAINT "programs_meta_info_length_check" CHECK("__new_programs"."meta_info" IS NULL OR length("__new_programs"."meta_info") BETWEEN 1 AND 10000)
);
--> statement-breakpoint
INSERT INTO `__new_programs`("id", "name", "meta_info") SELECT "id", "name", "meta_info" FROM `programs`;--> statement-breakpoint
DROP TABLE `programs`;--> statement-breakpoint
ALTER TABLE `__new_programs` RENAME TO `programs`;--> statement-breakpoint
CREATE TABLE `__new_reps_rpe_params` (
	`set_plan_id` text PRIMARY KEY NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real NOT NULL,
	FOREIGN KEY (`set_plan_id`) REFERENCES `set_plans`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reps_rpe_params_reps_check" CHECK("__new_reps_rpe_params"."reps" > 0),
	CONSTRAINT "reps_rpe_params_rpe_check" CHECK("__new_reps_rpe_params"."rpe" BETWEEN 1 AND 10)
);
--> statement-breakpoint
INSERT INTO `__new_reps_rpe_params`("set_plan_id", "reps", "rpe") SELECT "set_plan_id", "reps", "rpe" FROM `reps_rpe_params`;--> statement-breakpoint
DROP TABLE `reps_rpe_params`;--> statement-breakpoint
ALTER TABLE `__new_reps_rpe_params` RENAME TO `reps_rpe_params`;--> statement-breakpoint
CREATE TABLE `__new_set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_log_id` text NOT NULL,
	`weight_kg` real NOT NULL,
	`weight_input_unit` text NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real,
	`memo` text,
	`display_order` integer NOT NULL,
	FOREIGN KEY (`exercise_log_id`) REFERENCES `exercise_logs`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "set_logs_weight_kg_check" CHECK("__new_set_logs"."weight_kg" >= 0),
	CONSTRAINT "set_logs_reps_check" CHECK("__new_set_logs"."reps" >= 0),
	CONSTRAINT "set_logs_rpe_check" CHECK("__new_set_logs"."rpe" IS NULL OR "__new_set_logs"."rpe" BETWEEN 1 AND 10),
	CONSTRAINT "set_logs_memo_length_check" CHECK("__new_set_logs"."memo" IS NULL OR length("__new_set_logs"."memo") BETWEEN 1 AND 10000),
	CONSTRAINT "set_logs_display_order_check" CHECK("__new_set_logs"."display_order" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_set_logs`("id", "exercise_log_id", "weight_kg", "weight_input_unit", "reps", "rpe", "memo", "display_order") SELECT "id", "exercise_log_id", "weight_kg", "weight_input_unit", "reps", "rpe", "memo", "display_order" FROM `set_logs`;--> statement-breakpoint
DROP TABLE `set_logs`;--> statement-breakpoint
ALTER TABLE `__new_set_logs` RENAME TO `set_logs`;--> statement-breakpoint
CREATE INDEX `set_logs_exercise_log_id_idx` ON `set_logs` (`exercise_log_id`);--> statement-breakpoint
CREATE TABLE `__new_set_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_plan_id` text NOT NULL,
	`plan_type` text NOT NULL,
	`display_order` integer NOT NULL,
	`meta_info` text,
	FOREIGN KEY (`exercise_plan_id`) REFERENCES `exercise_plans`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "set_plans_meta_info_length_check" CHECK("__new_set_plans"."meta_info" IS NULL OR length("__new_set_plans"."meta_info") BETWEEN 1 AND 10000),
	CONSTRAINT "set_plans_display_order_check" CHECK("__new_set_plans"."display_order" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_set_plans`("id", "exercise_plan_id", "plan_type", "display_order", "meta_info") SELECT "id", "exercise_plan_id", "plan_type", "display_order", "meta_info" FROM `set_plans`;--> statement-breakpoint
DROP TABLE `set_plans`;--> statement-breakpoint
ALTER TABLE `__new_set_plans` RENAME TO `set_plans`;--> statement-breakpoint
CREATE INDEX `set_plans_exercise_plan_id_idx` ON `set_plans` (`exercise_plan_id`);--> statement-breakpoint
CREATE TABLE `__new_weight_reps_params` (
	`set_plan_id` text PRIMARY KEY NOT NULL,
	`weight_value` real NOT NULL,
	`weight_type` text NOT NULL,
	`reps` integer NOT NULL,
	FOREIGN KEY (`set_plan_id`) REFERENCES `set_plans`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "weight_reps_params_weight_value_check" CHECK("__new_weight_reps_params"."weight_value" >= 0),
	CONSTRAINT "weight_reps_params_reps_check" CHECK("__new_weight_reps_params"."reps" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_weight_reps_params`("set_plan_id", "weight_value", "weight_type", "reps") SELECT "set_plan_id", "weight_value", "weight_type", "reps" FROM `weight_reps_params`;--> statement-breakpoint
DROP TABLE `weight_reps_params`;--> statement-breakpoint
ALTER TABLE `__new_weight_reps_params` RENAME TO `weight_reps_params`;--> statement-breakpoint
CREATE TABLE `__new_weight_rpe_params` (
	`set_plan_id` text PRIMARY KEY NOT NULL,
	`weight_value` real NOT NULL,
	`weight_type` text NOT NULL,
	`rpe` real NOT NULL,
	FOREIGN KEY (`set_plan_id`) REFERENCES `set_plans`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "weight_rpe_params_weight_value_check" CHECK("__new_weight_rpe_params"."weight_value" >= 0),
	CONSTRAINT "weight_rpe_params_rpe_check" CHECK("__new_weight_rpe_params"."rpe" BETWEEN 1 AND 10)
);
--> statement-breakpoint
INSERT INTO `__new_weight_rpe_params`("set_plan_id", "weight_value", "weight_type", "rpe") SELECT "set_plan_id", "weight_value", "weight_type", "rpe" FROM `weight_rpe_params`;--> statement-breakpoint
DROP TABLE `weight_rpe_params`;--> statement-breakpoint
ALTER TABLE `__new_weight_rpe_params` RENAME TO `weight_rpe_params`;