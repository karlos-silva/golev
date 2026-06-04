#!/usr/bin/env bash
# Acesso rápido ao Postgres de PRODUÇÃO.
# Abre o túnel SSH e o Drizzle Studio já conectado, lendo a POSTGRES_PASSWORD
# do Infisical em runtime (nunca salva em disco; nada de senha hardcoded).
#
# Pré-requisitos:
#   - alias SSH `golev-db` no ~/.ssh/config (LocalForward 5433 -> VPS 127.0.0.1:5432)
#   - login no Infisical:  infisical login
#     (ou exporte INFISICAL_CLIENT_ID e INFISICAL_CLIENT_SECRET p/ machine identity)
#
# Uso:  pnpm db:prod        (ou: bash scripts/db-prod.sh)
set -euo pipefail

PROJECT_ID="<INFISICAL_PROJECT_ID>"
ENV_SLUG="prod"
SSH_ALIAS="golev-db"
LOCAL_PORT="5433"
DB_USER="golev"
DB_NAME="golev_pg"

infisical_export() {
  if [ -n "${INFISICAL_CLIENT_ID:-}" ] && [ -n "${INFISICAL_CLIENT_SECRET:-}" ]; then
    local token
    token=$(infisical login --method=universal-auth \
      --client-id="$INFISICAL_CLIENT_ID" \
      --client-secret="$INFISICAL_CLIENT_SECRET" --plain --silent)
    infisical export --token="$token" --projectId="$PROJECT_ID" \
      --env="$ENV_SLUG" --format=dotenv
  else
    infisical export --projectId="$PROJECT_ID" --env="$ENV_SLUG" --format=dotenv
  fi
}

echo "→ lendo POSTGRES_PASSWORD do Infisical ($ENV_SLUG)…"
PGPASS=$(infisical_export 2>/dev/null \
  | grep '^POSTGRES_PASSWORD=' | cut -d= -f2- | sed "s/^['\"]//; s/['\"]\$//")
if [ -z "${PGPASS:-}" ]; then
  echo "❌ não consegui ler a senha. Rode 'infisical login' (ou exporte INFISICAL_CLIENT_ID/SECRET)."
  exit 1
fi

OPENED="0"
if nc -z localhost "$LOCAL_PORT" 2>/dev/null; then
  echo "→ túnel já ativo em localhost:$LOCAL_PORT"
else
  echo "→ abrindo túnel SSH ($SSH_ALIAS)…"
  ssh -fN -o ExitOnForwardFailure=yes "$SSH_ALIAS"
  OPENED="1"
  for _ in $(seq 1 20); do nc -z localhost "$LOCAL_PORT" 2>/dev/null && break; sleep 0.3; done
fi
cleanup() { [ "$OPENED" = "1" ] && ssh -O exit "$SSH_ALIAS" 2>/dev/null || true; }
trap cleanup EXIT

export DATABASE_URL="postgresql://${DB_USER}:${PGPASS}@localhost:${LOCAL_PORT}/${DB_NAME}"
echo "→ conectado ao PROD via túnel. Abrindo Drizzle Studio (Ctrl+C encerra e fecha o túnel)…"
cd "$(dirname "$0")/../apps/api"
pnpm db:studio
