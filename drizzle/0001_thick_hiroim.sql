CREATE TABLE `argument_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`speechId` int,
	`parentId` int,
	`team` enum('government','opposition') NOT NULL,
	`nodeType` enum('argument','rebuttal','extension','summary') NOT NULL,
	`content` text NOT NULL,
	`transcriptSegment` text,
	`transcriptTimestamp` int,
	`qualityScore` int,
	`qualityExplanation` text,
	`wasAnswered` boolean DEFAULT false,
	`answeredById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `argument_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debate_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`participantId` int,
	`feedbackType` enum('individual','team','overall') NOT NULL,
	`team` enum('government','opposition'),
	`strongestArguments` json,
	`missedResponses` json,
	`improvements` json,
	`overallAnalysis` text,
	`suggestedWinner` enum('government','opposition'),
	`winningReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debate_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debate_motions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`motion` text NOT NULL,
	`topicArea` enum('politics','ethics','technology','economics','social','environment','education','health') NOT NULL,
	`difficulty` enum('novice','intermediate','advanced') NOT NULL DEFAULT 'intermediate',
	`backgroundContext` text,
	`keyStakeholders` json,
	`isAiGenerated` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debate_motions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debate_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`userId` int NOT NULL,
	`team` enum('government','opposition') NOT NULL,
	`speakerRole` enum('prime_minister','deputy_prime_minister','government_whip','leader_of_opposition','deputy_leader_of_opposition','opposition_whip') NOT NULL,
	`isReady` boolean DEFAULT false,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debate_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debate_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomCode` varchar(8) NOT NULL,
	`creatorId` int NOT NULL,
	`motionId` int,
	`status` enum('waiting','in_progress','completed','cancelled') NOT NULL DEFAULT 'waiting',
	`format` enum('asian_parliamentary') NOT NULL DEFAULT 'asian_parliamentary',
	`currentSpeakerIndex` int DEFAULT 0,
	`currentPhase` enum('setup','debate','feedback','completed') NOT NULL DEFAULT 'setup',
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debate_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `debate_rooms_roomCode_unique` UNIQUE(`roomCode`)
);
--> statement-breakpoint
CREATE TABLE `debate_speeches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`participantId` int NOT NULL,
	`speakerRole` varchar(64) NOT NULL,
	`speechType` enum('substantive','reply') NOT NULL DEFAULT 'substantive',
	`transcript` text,
	`audioUrl` varchar(512),
	`duration` int,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debate_speeches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_of_information` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`speechId` int NOT NULL,
	`offeredById` int NOT NULL,
	`accepted` boolean DEFAULT false,
	`content` text,
	`timestamp` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_of_information_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rule_violations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`speechId` int,
	`participantId` int NOT NULL,
	`violationType` enum('time_exceeded','new_argument_in_reply','poi_outside_window','speaking_out_of_turn') NOT NULL,
	`description` text,
	`timestamp` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rule_violations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `experienceLevel` enum('novice','intermediate','advanced','expert') DEFAULT 'novice';--> statement-breakpoint
ALTER TABLE `users` ADD `topicalInterests` json;--> statement-breakpoint
ALTER TABLE `users` ADD `background` text;--> statement-breakpoint
ALTER TABLE `users` ADD `debatesCompleted` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `profileCompleted` boolean DEFAULT false;