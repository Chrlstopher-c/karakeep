CREATE TABLE `agentActivity` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`agent` text NOT NULL,
	`path` text NOT NULL,
	`bookmarkId` text,
	`highlightId` text,
	`listId` text,
	`detail` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agentActivity_userId_createdAt_idx` ON `agentActivity` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `agentActivity_bookmarkId_idx` ON `agentActivity` (`bookmarkId`);--> statement-breakpoint
ALTER TABLE `apiKey` ADD `agent` text;