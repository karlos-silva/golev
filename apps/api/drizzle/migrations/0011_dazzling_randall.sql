ALTER TABLE "patients" ADD COLUMN "sex" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "height_cm" integer;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "goals" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "comorbidities" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "medications" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "contraindications" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
UPDATE "patients" p SET
  "sex" = a."sexo",
  "birth_date" = make_date((EXTRACT(YEAR FROM a."created_at"))::int - a."idade", 1, 1),
  "height_cm" = a."altura_cm",
  "phone" = a."whatsapp",
  "goals" = a."objetivos",
  "comorbidities" = a."comorbidades",
  "medications" = a."medicacoes",
  "contraindications" = a."contraindicacoes"
FROM "anamnese_submissions" a
WHERE p."anamnese_id" = a."id";--> statement-breakpoint
INSERT INTO "weight_logs" ("patient_id", "weight_kg", "measured_at", "source")
SELECT p."id", a."peso_kg", COALESCE(a."consent_at", a."created_at"), 'anamnese'
FROM "patients" p
JOIN "anamnese_submissions" a ON a."id" = p."anamnese_id"
WHERE NOT EXISTS (
  SELECT 1 FROM "weight_logs" w
  WHERE w."patient_id" = p."id" AND w."source" = 'anamnese'
);