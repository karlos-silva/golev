ALTER TABLE "anamnese_submissions" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "anamnese_submissions" ADD CONSTRAINT "anamnese_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anamnese_submissions_user_id_idx" ON "anamnese_submissions" USING btree ("user_id");