CREATE TABLE "session_run_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_run_id" uuid NOT NULL,
	"reference_image_id" uuid NOT NULL,
	"interval_seconds" integer NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preset_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"include_nsfw" boolean DEFAULT false NOT NULL,
	"total_seconds" integer NOT NULL,
	"images_count" integer NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_session_run_images_session_run_id" ON "session_run_images" USING btree ("session_run_id");--> statement-breakpoint
CREATE INDEX "idx_session_run_images_reference_image_id" ON "session_run_images" USING btree ("reference_image_id");--> statement-breakpoint
CREATE INDEX "idx_session_runs_preset_id" ON "session_runs" USING btree ("preset_id");--> statement-breakpoint
CREATE INDEX "idx_session_runs_completed_at" ON "session_runs" USING btree ("completed_at");