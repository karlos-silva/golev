# Schema do banco — Go Lev

> **Diagrama vivo do banco.** A fonte da verdade são os schemas Drizzle em
> [`apps/api/drizzle/schema/`](./schema). **Sempre que mudar o schema, atualize
> este arquivo** — ele é a visão de "como o banco está hoje".
>
> Os diagramas são [Mermaid](https://mermaid.js.org/) `erDiagram` — renderizam
> direto no GitHub e no preview de Markdown do VS Code. Cardinalidade:
> `||--o{` = um-para-muitos, `||--o|` = um-para-zero/um.

---

## Visão geral (estado atual)

```mermaid
erDiagram
  users ||--o{ refresh_tokens : "tem"
  users ||--o{ password_reset_tokens : "tem"
  users ||--o| anamnese_submissions : "talvez dono"
  users ||--o{ patients : "conta de login"
  users ||--o{ patients : "médico responsável"
  anamnese_submissions ||--o| patients : "converte em (SET NULL)"
  patients ||--o{ weight_logs : "pesagens"
  patients ||--o{ diet_plans : "planos"
  users ||--o{ diet_plans : "escrito por"
  anamnese_submissions ||--o{ appointments : "lead"
  patients ||--o{ appointments : "paciente"
  users ||--o{ appointments : "médico"
  patients ||--o{ consultation_requests : "solicita"
  appointments ||--o| consultation_requests : "atende"
  users ||--o| customers : "billing"
  customers ||--o{ subscriptions : "assina"
  customers ||--o{ invoices : "fatura"
  subscriptions ||--o{ invoices : "cobra"
  users ||--o{ redeemed_checkout_sessions : "resgata"
  users ||--o| google_calendar_connections : "conecta"

  users {
    uuid id PK
    text email
    text name
    text role
    bool is_doctor
    bool must_reset_password
    bool is_active
    timestamp deleted_at
  }
  refresh_tokens {
    uuid id PK
    uuid user_id FK
    text token_hash
    timestamp expires_at
    timestamp revoked_at
  }
  password_reset_tokens {
    uuid id PK
    uuid user_id FK
    text token_hash
    timestamp expires_at
    timestamp used_at
  }
  token_blocklist {
    uuid id PK
    text jti
    timestamp expires_at
  }
  anamnese_submissions {
    uuid id PK
    uuid user_id FK
    text nome
    text email
    text whatsapp
    text sexo
    int idade
    date birth_date
    int altura_cm
    numeric peso_kg
    array comorbidades
    array contraindicacoes
    array medicacoes
    numeric imc
    bool eligible
    array reasons
    text lead_status
    timestamp checkout_started_at
  }
  patients {
    uuid id PK
    uuid user_id FK
    uuid anamnese_id FK "origem do lead (nullable)"
    uuid doctor_id FK
    text status
    text sex
    date birth_date
    int height_cm
    text phone
    array goals
    array comorbidities
    array medications
    array contraindications
    timestamp profile_confirmed_at "null = paciente não revisou o perfil"
    timestamp started_at
    text notes
  }
  weight_logs {
    uuid id PK
    uuid patient_id FK
    numeric weight_kg
    timestamp measured_at
    text source "portal | patient_app | anamnese"
    text notes
  }
  diet_plans {
    uuid id PK
    uuid patient_id FK
    uuid doctor_id FK
    text title
    text content
    text file_url
    text status
  }
  appointments {
    uuid id PK
    uuid anamnese_id FK
    uuid patient_id FK
    uuid doctor_id FK
    timestamp scheduled_at
    text type
    text status
    text google_calendar_event_id
  }
  consultation_requests {
    uuid id PK
    uuid patient_id FK
    uuid appointment_id FK
    text preferred_period
    timestamp preferred_date
    text status
  }
  customers {
    uuid id PK
    uuid user_id FK
    text stripe_customer_id
  }
  subscriptions {
    uuid id PK
    uuid customer_id FK
    text stripe_subscription_id
    text status
    timestamp current_period_end
    bool cancel_at_period_end
  }
  invoices {
    uuid id PK
    uuid customer_id FK
    uuid subscription_id FK
    int amount_due
    int amount_paid
    text status
  }
  stripe_webhook_events {
    uuid id PK
    text stripe_event_id
    text type
    jsonb payload
    timestamp processed_at
  }
  redeemed_checkout_sessions {
    uuid id PK
    text stripe_session_id
    uuid user_id FK
    timestamp redeemed_at
  }
  google_calendar_connections {
    uuid id PK
    uuid user_id FK
    text google_email
    text refresh_token_enc
  }
```

### Domínios

| Domínio | Tabelas |
|---|---|
| **Auth** | `users`, `refresh_tokens`, `password_reset_tokens`, `token_blocklist` |
| **Lead** | `anamnese_submissions` |
| **Paciente** | `patients`, `weight_logs`, `diet_plans` |
| **Consultas** | `appointments`, `consultation_requests` |
| **Billing** | `customers`, `subscriptions`, `invoices`, `stripe_webhook_events`, `redeemed_checkout_sessions` |
| **Integrações** | `google_calendar_connections` |

---

## Refatoração do perfil clínico — APLICADA (2026-06-21)

**Status:** ✅ aplicada na migration `0011_dazzling_randall`. O diagrama de
"Visão geral" acima já reflete o estado novo. Esta seção fica como registro da
decisão e do que mudou.

### Problema (resolvido)

O perfil clínico e demográfico do paciente (sexo, idade, altura, peso inicial,
comorbidades, medicações, whatsapp, IMC) só existe em `anamnese_submissions` —
a tabela de **captação de lead**. A `patients` não tem nenhuma coluna clínica;
ela lê tudo via join no lead (`patients.anamnese_id`).

Como esse vínculo é `ON DELETE SET NULL` e o lead é, por design, purgável
(LGPD), **purgar um lead apaga o perfil clínico do paciente** — a tela de
evolução zera (altura/peso inicial/IMC viram `null`). É uma inversão de ciclo
de vida: a tabela mais efêmera é dona dos dados mais permanentes.

Lido em dois pontos hoje:
- `apps/api/src/modules/me/me.service.ts` (app do cliente) — altura, peso
  inicial e IMC vêm de `patient.anamnese`.
- `apps/api/src/modules/patients/patients.service.ts` (portal da equipe) —
  `findAll`/`findOne` puxam `imc, peso_kg, altura_cm, idade, sexo, comorbidades,
  whatsapp` da anamnese.

### Alvo

`patients` ganha perfil próprio; `weight_logs` vira a **única** série de peso (o
peso da anamnese entra como primeiro registro `source = 'anamnese'`);
`anamnese_submissions` fica como **snapshot imutável** de captação +
elegibilidade, e passa a ser seguro purgar.

```mermaid
erDiagram
  users ||--o{ patients : "conta de login"
  anamnese_submissions ||--o| patients : "origem (SET NULL, sem dado clínico)"
  patients ||--o{ weight_logs : "série de peso (inclui inicial)"
  patients ||--o{ diet_plans : "planos"

  patients {
    uuid id PK
    uuid user_id FK
    uuid anamnese_id FK "só rastreabilidade de origem"
    uuid doctor_id FK
    text status
    text sex "NOVO"
    date birth_date "NOVO (substitui idade int)"
    int height_cm "NOVO"
    text phone "NOVO (whatsapp)"
    array comorbidities "NOVO (estado atual, editável)"
    array medications "NOVO (estado atual, editável)"
    array contraindications "NOVO"
    timestamp started_at
    text notes
  }
  weight_logs {
    uuid id PK
    uuid patient_id FK
    numeric weight_kg
    timestamp measured_at
    text source "portal | patient_app | anamnese"
    text notes
  }
  anamnese_submissions {
    uuid id PK
    text sexo "snapshot do lead"
    int idade "snapshot do lead"
    int altura_cm "snapshot do lead"
    numeric peso_kg "snapshot do lead"
    numeric imc "decisão de elegibilidade"
    bool eligible
    array reasons
    text lead_status
  }
```

### Lógica da migração

1. **Schema** (`patients`): `ADD COLUMN` `sex`, `birth_date`, `height_cm`,
   `phone` (nullable) e `comorbidities`, `medications`, `contraindications`
   (`text[]` default `'{}'`).
2. **Backfill perfil**: `UPDATE patients p SET sex=a.sexo, height_cm=a.altura_cm,
   phone=a.whatsapp, comorbidities=a.comorbidades, medications=a.medicacoes,
   contraindications=a.contraindicacoes FROM anamnese_submissions a WHERE
   p.anamnese_id = a.id`. `birth_date` é aproximado do ano (`idade` é lossy) ou
   deixado `null` p/ a equipe completar.
3. **Backfill peso inicial → `weight_logs`**: `INSERT ... SELECT p.id, a.peso_kg,
   COALESCE(a.consent_at, a.created_at), 'anamnese' ... WHERE NOT EXISTS (log
   source='anamnese')`. Idempotente.
4. **Conversão** (`patients.service.ts` `provisionPatientAccount`): ao criar o
   `patient`, popular as novas colunas do lead e inserir o `weight_log` inicial
   (`source='anamnese'`) na mesma transação.
5. **Leitura app cliente** (`me.service.ts`): altura/IMC vêm de
   `patient.height_cm`; peso inicial vem do 1º `weight_log`. Para de depender de
   `patient.anamnese`.
6. **Leitura portal** (`patients.service.ts` `findAll`/`findOne`): ler as colunas
   de `patients`; manter `anamnese` só para origem/auditoria.
7. **Shared**: `WeightLogSource` ganha `ANAMNESE = 'anamnese'`; novo enum `Sex`;
   schemas Zod de edição de perfil pela equipe.

### O que ficou pra depois (dívida conhecida)

- ✅ **Portal lê o perfil de `patients`** (`patients.service` `findAll`/`findOne`):
  telefone, altura, idade, objetivos e comorbidades vêm do perfil vivo; só o IMC
  da avaliação inicial segue da `anamnese` (snapshot). Fecha a divergência com o
  card — paciente edita o perfil e o portal reflete na hora.
- **`birth_date`**: leads novos vêm com a data exata — o funil de anamnese
  coleta data de nascimento → `anamnese_submissions.birth_date` → conversão usa
  direto. Leads antigos (sem ela) têm a data aproximada do ano (derivada de
  `idade`), mitigada pelo card de confirmação no `/inicio`
  (`profile_confirmed_at`). `idade` na anamnese passou a ser derivada.

---

## Como manter este diagrama confiável

- **Fonte da verdade:** os schemas Drizzle em [`schema/`](./schema). Este `.md` é
  derivado — atualize no mesmo PR que mexer no schema.
- **Inspeção do banco ao vivo:** `pnpm --filter @golev/api db:studio` abre o
  Drizzle Studio (navega tabelas e linhas reais) pra conferir o banco contra este
  diagrama.
- **Migrations:** `db:generate` (gera SQL) → `db:migrate` (aplica). ⚠️ O banco de
  **dev** local tem histórico de migrations dessincronizado (squashes antigos);
  se `db:migrate` reclamar de "relation already exists", aplique a migration nova
  via `psql` e registre o hash em `drizzle.__drizzle_migrations`. Produção tem o
  histórico limpo.
