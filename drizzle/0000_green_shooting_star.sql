CREATE TABLE "reference_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"is_nsfw" boolean DEFAULT false NOT NULL,
	"width" integer,
	"height" integer,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"intervals_seconds" integer[] NOT NULL,
	"default_category" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_reference_images_category_is_nsfw" ON "reference_images" USING btree ("category","is_nsfw");--> statement-breakpoint
CREATE INDEX "idx_reference_images_tags" ON "reference_images" USING btree ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_session_presets_name_unique" ON "session_presets" USING btree ("name");