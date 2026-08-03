CREATE TABLE `awards` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`title` text NOT NULL,
	`issuer` text DEFAULT '',
	`date` text DEFAULT '',
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_award_master` ON `awards` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `certifications` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`name` text NOT NULL,
	`issuer` text DEFAULT '',
	`date` text DEFAULT '',
	`credential_url` text DEFAULT '',
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_cert_master` ON `certifications` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `cover_letters` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cv_id` text,
	`template_id` text,
	`job_id` text,
	`content` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `custom_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '[]' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_custom_master` ON `custom_sections` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `cv_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`cv_id` text NOT NULL,
	`section_type` text NOT NULL,
	`source_block_id` text,
	`override_content` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cvs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`master_profile_id` text,
	`template_id` text,
	`name` text NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `education_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`institution` text NOT NULL,
	`degree` text DEFAULT '',
	`field` text DEFAULT '',
	`start_date` text DEFAULT '',
	`end_date` text DEFAULT '',
	`gpa` text DEFAULT '',
	`details` text DEFAULT '',
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_edu_master` ON `education_blocks` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `experience_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '',
	`start_date` text DEFAULT '',
	`end_date` text DEFAULT '',
	`is_current` integer DEFAULT false NOT NULL,
	`employment_type` text DEFAULT 'Full-time' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_exp_master` ON `experience_blocks` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `experience_bullets` (
	`id` text PRIMARY KEY NOT NULL,
	`experience_block_id` text NOT NULL,
	`text` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`experience_block_id`) REFERENCES `experience_blocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_bullet_exp` ON `experience_bullets` (`experience_block_id`);--> statement-breakpoint
CREATE TABLE `job_events` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`type` text NOT NULL,
	`note` text DEFAULT '',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`job_url` text,
	`status` text DEFAULT 'wishlist' NOT NULL,
	`salary_range` text,
	`contact_name` text,
	`notes` text,
	`follow_up_date` text,
	`cv_id` text,
	`cover_letter_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`cover_letter_id`) REFERENCES `cover_letters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`name` text NOT NULL,
	`cefr_level` text DEFAULT 'B1' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lang_master` ON `languages` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `master_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`headline` text DEFAULT '' NOT NULL,
	`personal_info` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '',
	`tech` text DEFAULT '[]' NOT NULL,
	`link` text DEFAULT '',
	`start_date` text DEFAULT '',
	`end_date` text DEFAULT '',
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_proj_master` ON `projects` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `publications` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`citation` text NOT NULL,
	`date` text DEFAULT '',
	`link` text DEFAULT '',
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_pub_master` ON `publications` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `references` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`name` text NOT NULL,
	`relation` text DEFAULT '',
	`contact` text DEFAULT '',
	`visible` integer DEFAULT true NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_ref_master` ON `references` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'Tools' NOT NULL,
	`level` integer DEFAULT 3 NOT NULL,
	`years` integer,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_skill_master` ON `skills` (`master_profile_id`);--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`label` text NOT NULL,
	`text` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`format_type` text NOT NULL,
	`layout_schema` text NOT NULL,
	`theme_tokens` text NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firebase_uid` text,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`avatar_url` text,
	`plan` text DEFAULT 'free' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_firebase_uid_unique` ON `users` (`firebase_uid`);--> statement-breakpoint
CREATE TABLE `volunteer_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`master_profile_id` text NOT NULL,
	`organization` text NOT NULL,
	`role` text DEFAULT '',
	`start_date` text DEFAULT '',
	`end_date` text DEFAULT '',
	`details` text DEFAULT '',
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`master_profile_id`) REFERENCES `master_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_vol_master` ON `volunteer_blocks` (`master_profile_id`);