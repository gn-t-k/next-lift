ALTER TABLE `exercises` ADD `default_weight_input_unit` text DEFAULT 'kg' NOT NULL;--> statement-breakpoint
ALTER TABLE `weight_reps_params` DROP COLUMN `weight_input_unit`;--> statement-breakpoint
ALTER TABLE `weight_rpe_params` DROP COLUMN `weight_input_unit`;