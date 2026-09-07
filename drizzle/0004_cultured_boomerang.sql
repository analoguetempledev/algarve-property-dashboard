CREATE TABLE `offer_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`noteType` enum('note','milestone','system') NOT NULL DEFAULT 'note',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `offer_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`currentStep` enum('analysis','negotiation','due_diligence','make_offer','completion') NOT NULL DEFAULT 'analysis',
	`offer_status` enum('active','offer_sent','accepted','rejected','withdrawn','completed') NOT NULL DEFAULT 'active',
	`offerPrice` int,
	`counterOfferPrice` int,
	`finalPrice` int,
	`analysisCompleted` boolean NOT NULL DEFAULT false,
	`negotiationCompleted` boolean NOT NULL DEFAULT false,
	`dueDiligenceCompleted` boolean NOT NULL DEFAULT false,
	`offerCompleted` boolean NOT NULL DEFAULT false,
	`completionCompleted` boolean NOT NULL DEFAULT false,
	`analysisData` json,
	`negotiationData` json,
	`dueDiligenceData` json,
	`offerData` json,
	`completionData` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_offers_id` PRIMARY KEY(`id`)
);
