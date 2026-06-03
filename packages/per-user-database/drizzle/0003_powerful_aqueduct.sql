ALTER TABLE `exercises` ADD COLUMN `weight_step` real NOT NULL DEFAULT 2.5 CONSTRAINT `exercises_weight_step_check` CHECK (`weight_step` > 0);
