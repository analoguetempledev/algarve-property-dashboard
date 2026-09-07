CREATE TABLE `ai_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('opportunity','warning','trend','savings') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`confidence` int NOT NULL,
	`propertyId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(128) NOT NULL,
	`value` varchar(64) NOT NULL,
	`change_val` decimal(6,2) NOT NULL,
	`trend` enum('up','down','flat') NOT NULL DEFAULT 'flat',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `market_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(10) NOT NULL,
	`median` int NOT NULL,
	`listings` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`address` varchar(255) NOT NULL,
	`city` varchar(128) NOT NULL,
	`state` varchar(128) NOT NULL,
	`zip` varchar(20) NOT NULL,
	`price` int NOT NULL,
	`beds` int NOT NULL,
	`baths` int NOT NULL,
	`sqft` int NOT NULL,
	`yearBuilt` int NOT NULL,
	`daysOnMarket` int NOT NULL,
	`image` text NOT NULL,
	`status` enum('active','pending','sold') NOT NULL DEFAULT 'active',
	`aiScore` int NOT NULL,
	`riskLevel` enum('low','medium','high') NOT NULL DEFAULT 'low',
	`pricePerSqft` int NOT NULL,
	`estimatedValue` int NOT NULL,
	`commissionSavings` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`lat` decimal(10,6) NOT NULL,
	`lng` decimal(10,6) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `transaction_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int,
	`propertyAddress` varchar(255) NOT NULL,
	`stage` enum('offer_submitted','under_contract','inspection','appraisal','closing','closed') NOT NULL DEFAULT 'offer_submitted',
	`stageLabel` varchar(64) NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`offerPrice` int NOT NULL,
	`closingDate` varchar(10) NOT NULL,
	`daysRemaining` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);
