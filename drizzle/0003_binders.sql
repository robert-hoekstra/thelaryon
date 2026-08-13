CREATE TYPE "public"."binder_fill_strategy" AS ENUM('manual', 'set_order', 'collection_only');--> statement-breakpoint
CREATE TYPE "public"."binder_page_side" AS ENUM('front', 'back');--> statement-breakpoint
CREATE TABLE "binders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"page_count" integer NOT NULL,
	"rows_per_page" integer NOT NULL,
	"columns_per_page" integer NOT NULL,
	"double_sided" boolean DEFAULT true NOT NULL,
	"fill_strategy" "binder_fill_strategy" DEFAULT 'manual' NOT NULL,
	"set_code" text,
	"set_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "binder_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"binder_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"side" "binder_page_side" DEFAULT 'front' NOT NULL,
	"position" integer NOT NULL,
	"expected_scryfall_id" uuid,
	"expected_name" text,
	"expected_collector_number" text,
	"expected_image_small" text,
	"expected_image_normal" text,
	"collection_item_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "binder_slots_binder_id_page_number_side_position_unique" UNIQUE("binder_id","page_number","side","position")
);
--> statement-breakpoint
ALTER TABLE "binders" ADD CONSTRAINT "binders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "binder_slots" ADD CONSTRAINT "binder_slots_binder_id_binders_id_fk" FOREIGN KEY ("binder_id") REFERENCES "public"."binders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "binder_slots" ADD CONSTRAINT "binder_slots_collection_item_id_collection_items_id_fk" FOREIGN KEY ("collection_item_id") REFERENCES "public"."collection_items"("id") ON DELETE set null ON UPDATE no action;
