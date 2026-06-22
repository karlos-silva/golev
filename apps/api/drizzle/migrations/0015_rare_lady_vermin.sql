ALTER TABLE "patients" ADD COLUMN "exams_status" text DEFAULT 'nao_solicitado' NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "exams_status_at" timestamp with time zone;