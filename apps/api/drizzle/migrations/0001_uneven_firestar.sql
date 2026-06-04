CREATE TABLE "anamnese_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"objetivos" text[] NOT NULL,
	"sexo" text NOT NULL,
	"idade" integer NOT NULL,
	"altura_cm" integer NOT NULL,
	"peso_kg" numeric(5, 1) NOT NULL,
	"tentativas" text NOT NULL,
	"comorbidades" text[] NOT NULL,
	"contraindicacoes" text[] NOT NULL,
	"gravida_ou_amamentando" boolean,
	"tratamento_previo" text NOT NULL,
	"medicacoes" text[] DEFAULT '{}'::text[] NOT NULL,
	"imc" numeric(4, 1) NOT NULL,
	"eligible" boolean NOT NULL,
	"reasons" text[] NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"consent_text" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "anamnese_submissions_email_idx" ON "anamnese_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "anamnese_submissions_created_at_idx" ON "anamnese_submissions" USING btree ("created_at");