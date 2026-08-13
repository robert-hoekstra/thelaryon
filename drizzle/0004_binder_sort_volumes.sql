CREATE TYPE "public"."binder_sort_order" AS ENUM('collector_number', 'typeline', 'color', 'rarity', 'cmc', 'name');--> statement-breakpoint
ALTER TABLE "binders" ADD COLUMN "sort_order" "binder_sort_order" DEFAULT 'collector_number' NOT NULL;--> statement-breakpoint
ALTER TABLE "binders" ADD COLUMN "series_id" uuid;--> statement-breakpoint
ALTER TABLE "binders" ADD COLUMN "volume_index" integer;--> statement-breakpoint
ALTER TABLE "binders" ADD COLUMN "volume_count" integer;
