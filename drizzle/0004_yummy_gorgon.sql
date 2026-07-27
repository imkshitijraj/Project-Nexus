CREATE TABLE `budget_change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`actor_email` text NOT NULL,
	`change_type` text DEFAULT 'budget.update' NOT NULL,
	`before_json` text DEFAULT '{}' NOT NULL,
	`after_json` text DEFAULT '{}' NOT NULL,
	`reason` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `budget_change_log_project_idx` ON `budget_change_log` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `budget_change_log_actor_idx` ON `budget_change_log` (`actor_email`,`created_at`);--> statement-breakpoint
CREATE TABLE `project_budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`allocated_amount` integer DEFAULT 0 NOT NULL,
	`spent_amount` integer DEFAULT 0 NOT NULL,
	`committed_amount` integer DEFAULT 0 NOT NULL,
	`forecast_amount` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_budgets_project_unique` ON `project_budgets` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_budgets_updated_idx` ON `project_budgets` (`updated_at`);