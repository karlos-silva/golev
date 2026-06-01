#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Setup inicial da VPS para um produto SaaS Trianox.
#
# Uso:
#   ./scripts/setup-vps.sh <VPS_HOST> <VPS_USER> <DOMAIN> [PRODUCT_NAME]
#
# Exemplo:
#   ./scripts/setup-vps.sh 123.45.67.89 deploy meuapp.com.br meuapp
#
# Pré-requisitos na VPS:
#   - SSH acessível com key (sem senha)
#   - Docker e Docker Compose instalados
#   - Usuário de deploy criado (não usar root)
#
# O que este script faz:
#   1. Cria a estrutura de diretórios (production + staging)
#   2. Copia docker-compose.yml, Caddyfile e .env template
#   3. Configura autenticação com GHCR (GitHub Container Registry)
#   4. Configura firewall (UFW)
# ─────────────────────────────────────────────────────────────────────────────

if [ $# -lt 3 ]; then
  echo "Uso: $0 <VPS_HOST> <VPS_USER> <DOMAIN> [PRODUCT_NAME]"
  echo ""
  echo "  VPS_HOST      IP ou hostname da VPS"
  echo "  VPS_USER      Usuário de deploy (ex: deploy)"
  echo "  DOMAIN        Domínio principal (ex: meuapp.com.br)"
  echo "  PRODUCT_NAME  Nome do produto (default: saas)"
  echo ""
  echo "Exemplo:"
  echo "  $0 123.45.67.89 deploy meuapp.com.br meuapp"
  exit 1
fi

VPS_HOST="$1"
VPS_USER="$2"
DOMAIN="$3"
PRODUCT="${4:-saas}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SSH_CMD="ssh ${VPS_USER}@${VPS_HOST}"
SCP_CMD="scp -q"

echo "╔══════════════════════════════════════════════════╗"
echo "║  Trianox SaaS — Setup VPS                       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  VPS:      ${VPS_USER}@${VPS_HOST}"
echo "  Domínio:  ${DOMAIN}"
echo "  Produto:  ${PRODUCT}"
echo ""

read -rp "  GitHub org ou username (dono do repo, para GHCR): " GHCR_OWNER
GHCR_OWNER="${GHCR_OWNER:-tria-nox}"
echo ""

# ── 1. Verificar conexão SSH ──────────────────────────────────────────────────
echo "→ Verificando conexão SSH..."
if ! $SSH_CMD "echo ok" > /dev/null 2>&1; then
  echo "✗ Não foi possível conectar em ${VPS_USER}@${VPS_HOST}"
  echo "  Verifique se a chave SSH está configurada."
  exit 1
fi
echo "  ✓ Conexão OK"

# ── 2. Verificar Docker na VPS ────────────────────────────────────────────────
echo "→ Verificando Docker..."
if ! $SSH_CMD "docker info" > /dev/null 2>&1; then
  echo "  Docker não encontrado. Instalando..."
  $SSH_CMD "curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker \$USER"
  echo "  ✓ Docker instalado (pode precisar reconectar para o grupo docker)"
else
  echo "  ✓ Docker OK"
fi

# ── 3. Criar estrutura de diretórios ──────────────────────────────────────────
echo "→ Criando estrutura de diretórios..."
$SSH_CMD "mkdir -p ~/apps/${PRODUCT}/production/caddy ~/apps/${PRODUCT}/staging/caddy"
echo "  ✓ ~/apps/${PRODUCT}/production/"
echo "  ✓ ~/apps/${PRODUCT}/staging/"

# ── 4. Gerar docker-compose para cada ambiente ───────────────────────────────
echo "→ Enviando docker-compose.yml..."

COMPOSE_FILE="${ROOT_DIR}/infra/docker-compose.prod.yml"

$SCP_CMD "$COMPOSE_FILE" "${VPS_USER}@${VPS_HOST}:~/apps/${PRODUCT}/production/docker-compose.yml"
$SCP_CMD "$COMPOSE_FILE" "${VPS_USER}@${VPS_HOST}:~/apps/${PRODUCT}/staging/docker-compose.yml"
echo "  ✓ docker-compose.yml copiado para ambos os ambientes"

# ── 5. Gerar Caddyfile ───────────────────────────────────────────────────────
echo "→ Gerando Caddyfile..."

PROD_CADDYFILE=$(cat <<EOF
${DOMAIN} {
    handle /_next/static/* {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy web:3000
    }
    handle {
        reverse_proxy web:3000
    }
}

api.${DOMAIN} {
    reverse_proxy api:3333
}
EOF
)

STG_CADDYFILE=$(cat <<EOF
stg.${DOMAIN} {
    handle /_next/static/* {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy web:3000
    }
    handle {
        reverse_proxy web:3000
    }
}

api-stg.${DOMAIN} {
    reverse_proxy api:3333
}
EOF
)

echo "$PROD_CADDYFILE" | $SSH_CMD "cat > ~/apps/${PRODUCT}/production/caddy/Caddyfile"
echo "$STG_CADDYFILE" | $SSH_CMD "cat > ~/apps/${PRODUCT}/staging/caddy/Caddyfile"
echo "  ✓ Caddyfile gerado com domínio ${DOMAIN}"

# ── 6. Gerar .env template para cada ambiente ─────────────────────────────────
echo "→ Gerando .env template..."

generate_env() {
  local env_name="$1"
  local node_env="$2"
  local api_url="$3"

  cat <<EOF
# ── Database ──
DATABASE_URL=postgresql://USUARIO:SENHA@db:5432/${PRODUCT}_${env_name}
POSTGRES_USER=USUARIO
POSTGRES_PASSWORD=SENHA
POSTGRES_DB=${PRODUCT}_${env_name}

# ── API ──
PORT=3333
NODE_ENV=${node_env}
ALLOWED_ORIGINS=$( [ "${env_name}" = "production" ] && echo "https://${DOMAIN},https://www.${DOMAIN}" || echo "https://stg.${DOMAIN}" )
REQUEST_BODY_LIMIT_BYTES=1048576
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Frontend ──
NEXT_PUBLIC_API_URL=${api_url}
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ── Stripe ──
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# ── Storage ──
UPLOADS_DIR=/data/uploads

# ── Email ──
RESEND_API_KEY=

# ── Analytics ──
POSTHOG_API_KEY=

# ── GHCR ──
PRODUCT_NAME=${PRODUCT}
GHCR_OWNER=${GHCR_OWNER}
EOF
}

generate_env "production" "production" "https://api.${DOMAIN}" | \
  $SSH_CMD "cat > ~/apps/${PRODUCT}/production/.env"

generate_env "staging" "staging" "https://api-stg.${DOMAIN}" | \
  $SSH_CMD "cat > ~/apps/${PRODUCT}/staging/.env"

echo "  ✓ .env gerado (JWT secrets aleatórios incluídos)"
echo "  ⚠  EDITE os .env na VPS com credenciais reais (DB, Stripe, etc.)"

# ── 7. Autenticar com GHCR ───────────────────────────────────────────────────
echo ""
echo "→ Configurar autenticação com GitHub Container Registry (GHCR)..."
echo "  O Docker na VPS precisa autenticar com ghcr.io para puxar imagens."
echo ""

read -rp "  Tem um GitHub PAT com scope 'read:packages'? (s/n): " HAS_TOKEN

if [ "$HAS_TOKEN" = "s" ]; then
  read -rsp "  Cole o token (não será exibido): " GHCR_TOKEN
  echo ""
  read -rp "  Username do GitHub: " GHCR_USER

  echo "$GHCR_TOKEN" | $SSH_CMD "docker login ghcr.io -u ${GHCR_USER} --password-stdin"
  echo "  ✓ Autenticado com ghcr.io"
else
  echo ""
  echo "  ⚠  Sem autenticação GHCR, o deploy não vai conseguir puxar imagens."
  echo "     Crie um PAT em: https://github.com/settings/tokens"
  echo "     Scope necessário: read:packages"
  echo "     Depois rode na VPS:"
  echo "       echo TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
fi

# ── 8. Firewall ───────────────────────────────────────────────────────────────
echo ""
echo "→ Configurando firewall (UFW)..."
$SSH_CMD "sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && echo 'y' | sudo ufw enable" 2>/dev/null || echo "  ⚠  UFW não disponível ou já configurado"
echo "  ✓ Firewall: 22 (SSH), 80 (HTTP), 443 (HTTPS)"

# ── 9. Resumo ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Setup concluído!                                ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  Estrutura na VPS:"
echo "    ~/apps/${PRODUCT}/production/"
echo "    ├── docker-compose.yml"
echo "    ├── caddy/Caddyfile"
echo "    └── .env  ← EDITAR com credenciais reais"
echo ""
echo "    ~/apps/${PRODUCT}/staging/"
echo "    ├── docker-compose.yml"
echo "    ├── caddy/Caddyfile"
echo "    └── .env  ← EDITAR com credenciais reais"
echo ""
echo "  Próximos passos:"
echo "    1. SSH na VPS e editar os .env com credenciais reais:"
echo "       ssh ${VPS_USER}@${VPS_HOST}"
echo "       nano ~/apps/${PRODUCT}/production/.env"
echo "       nano ~/apps/${PRODUCT}/staging/.env"
echo ""
echo "    2. Configurar DNS (A records):"
echo "       ${DOMAIN}         → ${VPS_HOST}"
echo "       api.${DOMAIN}     → ${VPS_HOST}"
echo "       stg.${DOMAIN}     → ${VPS_HOST}"
echo "       api-stg.${DOMAIN} → ${VPS_HOST}"
echo ""
echo "    3. Configurar secrets no GitHub (Settings > Secrets):"
echo "       VPS_HOST    = ${VPS_HOST}"
echo "       VPS_USER    = ${VPS_USER}"
echo "       VPS_SSH_KEY = (chave privada SSH)"
echo ""
echo "    4. Primeiro deploy:"
echo "       git tag v0.1.0 && git push origin v0.1.0"
echo ""
