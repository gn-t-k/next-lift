CREATE TABLE `days` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`label` text NOT NULL,
	`display_order` integer NOT NULL,
	`meta_info` text,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `days_program_id_idx` ON `days` (`program_id`);--> statement-breakpoint
CREATE TABLE `exercise_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`memo` text,
	`display_order` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exercise_logs_workout_id_idx` ON `exercise_logs` (`workout_id`);--> statement-breakpoint
CREATE INDEX `exercise_logs_exercise_id_idx` ON `exercise_logs` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `exercise_plan_exercises` (
	`exercise_plan_id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	FOREIGN KEY (`exercise_plan_id`) REFERENCES `exercise_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exercise_plan_exercises_exercise_id_idx` ON `exercise_plan_exercises` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `exercise_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`display_order` integer NOT NULL,
	`meta_info` text,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exercise_plans_day_id_idx` ON `exercise_plans` (`day_id`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `one_rep_maxes` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`weight_kg` real NOT NULL,
	`weight_input_unit` text NOT NULL,
	`achieved_at` integer NOT NULL,
	`registered_at` integer NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `one_rep_maxes_exercise_id_idx` ON `one_rep_maxes` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`meta_info` text
);
--> statement-breakpoint
CREATE TABLE `reps_rpe_params` (
	`set_plan_id` text PRIMARY KEY NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real NOT NULL,
	FOREIGN KEY (`set_plan_id`) REFERENCES `set_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_log_id` text NOT NULL,
	`weight_kg` real NOT NULL,
	`weight_input_unit` text NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real,
	`memo` text,
	`display_order` integer NOT NULL,
	FOREIGN KEY (`exercise_log_id`) REFERENCES `exercise_logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `set_logs_exercise_log_id_idx` ON `set_logs` (`exercise_log_id`);--> statement-breakpoint
CREATE TABLE `set_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_plan_id` text NOT NULL,
	`plan_type` text NOT NULL,
	`display_order` integer NOT NULL,
	`meta_info` text,
	FOREIGN KEY (`exercise_plan_id`) REFERENCES `exercise_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `set_plans_exercise_plan_id_idx` ON `set_plans` (`exercise_plan_id`);--> statement-breakpoint
CREATE TABLE `weight_reps_params` (
	`set_plan_id` text PRIMARY KEY NOT NULL,
	`weight_value` real NOT NULL,
	`weight_type` text NOT NULL,
	`weight_input_unit` text NOT NULL,
	`reps` integer NOT NULL,
	FOREIGN KEY (`set_plan_id`) REFERENCES `set_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `weight_rpe_params` (
	`set_plan_id` text PRIMARY KEY NOT NULL,
	`weight_value` real NOT NULL,
	`weight_type` text NOT NULL,
	`weight_input_unit` text NOT NULL,
	`rpe` real NOT NULL,
	FOREIGN KEY (`set_plan_id`) REFERENCES `set_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_completions_workout_id_unique` ON `workout_completions` (`workout_id`);--> statement-breakpoint
CREATE TABLE `workout_day_links` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`day_id` text NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_day_links_workout_id_unique` ON `workout_day_links` (`workout_id`);--> statement-breakpoint
CREATE INDEX `workout_day_links_day_id_idx` ON `workout_day_links` (`day_id`);--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL
);
