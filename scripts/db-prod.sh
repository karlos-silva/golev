#!/usr/bin/env bash
# Acesso rápido ao Postgres de PRODUÇÃO.
# Abre o túnel SSH e o Drizzle Studio já conectado, lendo a DATABASE_URL
# do Infisical em runtime (a MESMA que a API usa) e só trocando o host
# interno (db:5432) pelo túnel local. Nada é salvo em disco.
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
INTERNAL_HOST="db:5432" # host:porta do Postgres na rede Docker do prod

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

echo "→ lendo DATABASE_URL do Infisical ($ENV_SLUG)…"
PROD_DB_URL=$(infisical_export 2>/dev/null \
  | grep '^DATABASE_URL=' | cut -d= -f2- | sed "s/^['\"]//; s/['\"]\$//")
if [ -z "${PROD_DB_URL:-}" ]; then
  echo "❌ não consegui ler a DATABASE_URL. Rode 'infisical login' (ou exporte INFISICAL_CLIENT_ID/SECRET)."
  exit 1
fi
# Reaproveita a URL exata da API, trocando só o host interno pelo túnel local.
LOCAL_DB_URL="${PROD_DB_URL/@${INTERNAL_HOST}\//@localhost:${LOCAL_PORT}/}"
if [ "$LOCAL_DB_URL" = "$PROD_DB_URL" ]; then
  echo "⚠️  não encontrei '@${INTERNAL_HOST}/' na DATABASE_URL — verifique o host do banco no Infisical."
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

export DATABASE_URL="$LOCAL_DB_URL"
echo "→ conectado ao PROD via túnel. Abrindo Drizzle Studio (Ctrl+C encerra e fecha o túnel)…"
cd "$(dirname "$0")/../apps/api"
pnpm db:studio
