CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`wishlist_id` text NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE no action ON DELETE cascade
);
