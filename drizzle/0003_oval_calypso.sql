CREATE TABLE `automation_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`trigger_type` text NOT NULL,
	`action_type` text NOT NULL,
	`cadence` text DEFAULT 'daily' NOT NULL,
	`config_json` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'disabled' NOT NULL,
	`last_run_at` text,
	`next_run_at` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `automation_rules_status_next_idx` ON `automation_rules` (`status`,`next_run_at`);--> statement-breakpoint
CREATE TABLE `automation_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rule_id` integer NOT NULL,
	`status` text DEFAULT 'succeeded' NOT NULL,
	`matched_count` integer DEFAULT 0 NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`request_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `automation_rules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `automation_runs_rule_idx` ON `automation_runs` (`rule_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `integration_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`status` text DEFAULT 'not_connected' NOT NULL,
	`account_label` text DEFAULT '' NOT NULL,
	`scopes` text DEFAULT '[]' NOT NULL,
	`config_json` text DEFAULT '{}' NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `integration_connections_provider_unique` ON `integration_connections` (`provider`);--> statement-breakpoint
CREATE TABLE `workspace_api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`secret_hash` text NOT NULL,
	`scopes_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_used_at` text,
	`expires_at` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_api_keys_prefix_unique` ON `workspace_api_keys` (`prefix`);--> statement-breakpoint
CREATE TABLE `workspace_custom_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`permissions_json` text DEFAULT '[]' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_custom_roles_name_unique` ON `workspace_custom_roles` (`name`);--> statement-breakpoint
CREATE TABLE `workspace_policies` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
