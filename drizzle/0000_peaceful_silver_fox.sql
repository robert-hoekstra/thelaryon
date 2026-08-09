CREATE TYPE "public"."card_condition" AS ENUM('MINT', 'NEAR_MINT', 'EXCELLENT', 'GOOD', 'LIGHT_PLAYED', 'PLAYED', 'POOR');--> statement-breakpoint
CREATE TYPE "public"."card_finish" AS ENUM('NON_FOIL', 'FOIL', 'ETCHED');--> statement-breakpoint
CREATE TABLE "collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scryfall_id" uuid NOT NULL,
	"name" text NOT NULL,
	"set_code" text NOT NULL,
	"set_name" text NOT NULL,
	"collector_number" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"condition" "card_condition" DEFAULT 'NEAR_MINT' NOT NULL,
	"finish" "card_finish" DEFAULT 'NON_FOIL' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"purchase_price" numeric(10, 2),
	"purchase_date" timestamp with time zone,
	"current_price" numeric(10, 2),
	"image_small" text,
	"image_normal" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;