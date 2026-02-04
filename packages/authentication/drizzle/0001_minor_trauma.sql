CREATE TABLE `per_user_database` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`database_name` text NOT NULL,
	`database_url` text NOT NULL,
	`encrypted_token` text NOT NULL,
	`token_expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `per_user_database_user_id_unique` ON `per_user_database` (`user_id`);