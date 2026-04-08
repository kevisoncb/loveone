CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tributePageId` int,
	`planType` enum('essential','premium') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`stripePaymentIntentId` varchar(255),
	`stripeCustomerId` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tribute_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`uniqueSlug` varchar(64) NOT NULL,
	`partner1Name` varchar(255) NOT NULL,
	`partner2Name` varchar(255) NOT NULL,
	`relationshipStartDate` timestamp NOT NULL,
	`photoUrls` text NOT NULL,
	`musicYoutubeUrl` varchar(500),
	`planType` enum('essential','premium') NOT NULL,
	`planExpiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tribute_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `tribute_pages_uniqueSlug_unique` UNIQUE(`uniqueSlug`)
);
