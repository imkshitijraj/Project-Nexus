CREATE TABLE `operational_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`tier` text DEFAULT 'tier_2' NOT NULL,
	`status` text DEFAULT 'operational' NOT NULL,
	`owner_email` text,
	`availability_target_bps` integer DEFAULT 9990 NOT NULL,
	`current_availability_bps` integer DEFAULT 10000 NOT NULL,
	`rto_minutes` integer DEFAULT 60 NOT NULL,
	`rpo_minutes` integer DEFAULT 15 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operational_services_project_name_unique` ON `operational_services` (`project_id`,`name`);--> statement-breakpoint
CREATE INDEX `operational_services_status_idx` ON `operational_services` (`status`,`tier`);--> statement-breakpoint
CREATE TABLE `recovery_runbooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_id` integer NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`owner_email` text,
	`trigger` text DEFAULT '' NOT NULL,
	`steps_json` text DEFAULT '[]' NOT NULL,
	`last_tested_at` text,
	`next_review_date` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `operational_services`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recovery_runbooks_service_idx` ON `recovery_runbooks` (`service_id`,`status`);--> statement-breakpoint
CREATE INDEX `recovery_runbooks_review_idx` ON `recovery_runbooks` (`next_review_date`);--> statement-breakpoint
CREATE TABLE `reliability_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_id` integer NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`risk_level` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`owner_email` text,
	`window_start` text NOT NULL,
	`window_end` text NOT NULL,
	`implementation_plan` text DEFAULT '' NOT NULL,
	`rollback_plan` text DEFAULT '' NOT NULL,
	`decision_reason` text DEFAULT '' NOT NULL,
	`decided_by` text,
	`decided_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `operational_services`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reliability_changes_project_status_idx` ON `reliability_changes` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `reliability_changes_window_idx` ON `reliability_changes` (`window_start`,`window_end`);--> statement-breakpoint
CREATE TABLE `reliability_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`service_id` integer,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer,
	`detail` text DEFAULT '' NOT NULL,
	`before_json` text DEFAULT '{}' NOT NULL,
	`after_json` text DEFAULT '{}' NOT NULL,
	`risk` text DEFAULT 'low' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `operational_services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `reliability_events_project_idx` ON `reliability_events` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `reliability_events_target_idx` ON `reliability_events` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `reliability_incidents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_id` integer NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`severity` text DEFAULT 'sev_3' NOT NULL,
	`status` text DEFAULT 'investigating' NOT NULL,
	`commander_email` text,
	`impact` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`started_at` text NOT NULL,
	`resolved_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `operational_services`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reliability_incidents_project_status_idx` ON `reliability_incidents` (`project_id`,`status`);--> statement-breakpoint
CREATE INDEX `reliability_incidents_service_started_idx` ON `reliability_incidents` (`service_id`,`started_at`);