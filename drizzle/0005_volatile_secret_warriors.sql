CREATE TABLE `portfolio_change_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`actor_email` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`action` text NOT NULL,
	`before_json` text DEFAULT '{}' NOT NULL,
	`after_json` text DEFAULT '{}' NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `portfolio_change_log_project_idx` ON `portfolio_change_log` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `portfolio_change_log_entity_idx` ON `portfolio_change_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `project_milestones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`owner_email` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_milestones_project_due_idx` ON `project_milestones` (`project_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `project_milestones_status_due_idx` ON `project_milestones` (`status`,`due_date`);--> statement-breakpoint
CREATE TABLE `project_risks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`probability` integer DEFAULT 3 NOT NULL,
	`impact` integer DEFAULT 3 NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`owner_email` text,
	`mitigation` text DEFAULT '' NOT NULL,
	`target_date` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_risks_project_status_idx` ON `project_risks` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `project_risks_owner_idx` ON `project_risks` (`owner_email`,`target_date`);--> statement-breakpoint
ALTER TABLE `projects` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `updated_by` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;