CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`department` text DEFAULT 'Product & Engineering' NOT NULL,
	`priority` text DEFAULT 'High' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`health` text DEFAULT 'On track' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`budget` integer DEFAULT 0 NOT NULL,
	`due` text DEFAULT 'Oct 15' NOT NULL,
	`color` text DEFAULT '#c8b8ff' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
