#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

log()  { echo -e "${BLUE}▸${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  SaaS Template — Init${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$ROOT_DIR"

# ------------------------------------------------------------------
# 1. Collect info
# ------------------------------------------------------------------
read -rp "$(echo -e "${BLUE}?${NC}") Nome do produto (ex: acmesaas): " PRODUCT_NAME
[[ -z "$PRODUCT_NAME" ]] && err "Nome do produto é obrigatório"

read -rp "$(echo -e "${BLUE}?${NC}") Nome da empresa (ex: Acme Inc): " COMPANY_NAME
[[ -z "$COMPANY_NAME" ]] && err "Nome da empresa é obrigatório"

read -rp "$(echo -e "${BLUE}?${NC}") Scope npm (sem @, ex: acme): " NPM_SCOPE
[[ -z "$NPM_SCOPE" ]] && err "Scope npm é obrigatório"

read -rp "$(echo -e "${BLUE}?${NC}") Org do GitHub (ex: acme-dev): " GITHUB_ORG
[[ -z "$GITHUB_ORG" ]] && err "Org do GitHub é obrigatória"

read -rp "$(echo -e "${BLUE}?${NC}") Descrição curta do produto: " PRODUCT_DESC
PRODUCT_DESC="${PRODUCT_DESC:-Plataforma SaaS moderna}"

echo ""
echo -e "${BOLD}Resumo:${NC}"
echo "  Produto:    $PRODUCT_NAME"
echo "  Empresa:    $COMPANY_NAME"
echo "  Scope:      @$NPM_SCOPE"
echo "  GitHub org: $GITHUB_ORG"
echo "  Descrição:  $PRODUCT_DESC"
echo ""

read -rp "$(echo -e "${YELLOW}?${NC}") Confirmar e iniciar? (y/N): " CONFIRM
[[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]] && err "Cancelado pelo usuário"

echo ""

# ------------------------------------------------------------------
# 2. Find-and-replace branding
# ------------------------------------------------------------------
log "Substituindo @trianox/ → @${NPM_SCOPE}/ ..."

find . -type f \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path '*/node_modules/*' \
  -not -path './pnpm-lock.yaml' \
  -not -path './scripts/init-template.sh' \
  -not -name '*.svg' \
  -not -name '*.png' \
  -not -name '*.ico' \
  | while IFS= read -r file; do
    if file "$file" | grep -q 'text'; then
      sed -i '' "s|@trianox/|@${NPM_SCOPE}/|g" "$file" 2>/dev/null || true
      sed -i '' "s|trianox-saas-template|${PRODUCT_NAME}|g" "$file" 2>/dev/null || true
      sed -i '' "s|trianox-saas|${PRODUCT_NAME}|g" "$file" 2>/dev/null || true
      sed -i '' "s|Trianox SaaS|${COMPANY_NAME} SaaS|g" "$file" 2>/dev/null || true
      sed -i '' "s|Trianox|${COMPANY_NAME}|g" "$file" 2>/dev/null || true
      sed -i '' "s|trianox|${PRODUCT_NAME}|g" "$file" 2>/dev/null || true
      sed -i '' "s|tria-nox|${GITHUB_ORG}|g" "$file" 2>/dev/null || true
    fi
  done

ok "Branding substituído"

# ------------------------------------------------------------------
# 3. Update package names
# ------------------------------------------------------------------
log "Atualizando package.json files..."

PRODUCT_NAME_LOWER=$(echo "$PRODUCT_NAME" | tr '[:upper:]' '[:lower:]')

sed -i '' "s|\"name\": \".*\"|\"name\": \"${PRODUCT_NAME_LOWER}\"|" package.json 2>/dev/null || true
sed -i '' "s|\"name\": \".*\"|\"name\": \"@${NPM_SCOPE}/shared\"|" packages/shared/package.json 2>/dev/null || true
sed -i '' "s|\"name\": \".*\"|\"name\": \"@${NPM_SCOPE}/web\"|" apps/web/package.json 2>/dev/null || true
sed -i '' "s|\"name\": \".*\"|\"name\": \"@${NPM_SCOPE}/api\"|" apps/api/package.json 2>/dev/null || true

ok "Package names atualizados"

# ------------------------------------------------------------------
# 4. Update deploy/infra defaults
# ------------------------------------------------------------------
log "Atualizando infra e deploy..."

if [[ -f infra/docker-compose.prod.yml ]]; then
  sed -i '' "s|GHCR_OWNER:-tria-nox|GHCR_OWNER:-${GITHUB_ORG}|g" infra/docker-compose.prod.yml 2>/dev/null || true
  sed -i '' "s|PRODUCT_NAME:-saas|PRODUCT_NAME:-${PRODUCT_NAME_LOWER}|g" infra/docker-compose.prod.yml 2>/dev/null || true
fi

if [[ -f .github/workflows/deploy.yml ]]; then
  sed -i '' "s|PRODUCT_NAME: saas|PRODUCT_NAME: ${PRODUCT_NAME_LOWER}|g" .github/workflows/deploy.yml 2>/dev/null || true
fi

ok "Infra atualizada"

# ------------------------------------------------------------------
# 5. Clean placeholder content
# ------------------------------------------------------------------
log "Limpando conteúdo placeholder..."

PLACEHOLDER_PAGES=(
  "apps/web/src/app/(marketing)/blog/page.tsx"
  "apps/web/src/app/(marketing)/blog/[slug]/page.tsx"
  "apps/web/src/app/(marketing)/features/[slug]/page.tsx"
  "apps/web/src/app/(marketing)/legal/terms/page.tsx"
  "apps/web/src/app/(marketing)/legal/privacy/page.tsx"
)

for page in "${PLACEHOLDER_PAGES[@]}"; do
  if [[ -f "$page" ]]; then
    echo "// TODO: Implementar conteúdo real
export default function Page() {
  return <div className=\"mx-auto max-w-4xl px-6 py-24\"><h1 className=\"text-3xl font-bold\">Em construção</h1></div>;
}
" > "$page"
  fi
done

ok "Placeholders limpos"

# ------------------------------------------------------------------
# 6. Remove template-specific files
# ------------------------------------------------------------------
log "Removendo arquivos do template..."

rm -f trianox-sass-architecture.md 2>/dev/null || true
rm -f .cursor/plans/*.plan.md 2>/dev/null || true

ok "Arquivos do template removidos"

# ------------------------------------------------------------------
# 7. Update README
# ------------------------------------------------------------------
log "Gerando README limpo..."

cat > README.md << READMEEOF
# ${COMPANY_NAME}

${PRODUCT_DESC}

## Setup

\`\`\`bash
pnpm install
cp .env.example .env  # editar com valores reais
docker compose -f infra/docker-compose.yml up db -d
pnpm -F @${NPM_SCOPE}/api drizzle-kit migrate
pnpm dev
\`\`\`

- **Web:** http://localhost:3000
- **API:** http://localhost:3333

## Stack

| Camada | Tech |
|--------|------|
| Frontend | Next.js, Tailwind CSS v4, shadcn/ui |
| Backend | NestJS, Fastify, Drizzle ORM |
| Database | PostgreSQL |
| Shared | \`@${NPM_SCOPE}/shared\` (Zod, tipos, contratos) |
| Infra | Docker, Caddy, GitHub Actions |

## Scripts

| Comando | Descrição |
|---------|-----------|
| \`pnpm dev\` | Dev server (web + api) |
| \`pnpm build\` | Build de produção |
| \`pnpm lint\` | Lint com ESLint |
| \`pnpm typecheck\` | TypeScript check |
| \`pnpm test:unit\` | Testes unitários |
| \`pnpm test:e2e\` | Testes E2E (Playwright) |

## Deploy

Ver \`scripts/setup-vps.sh\` para configuração inicial da VPS.
CI/CD via GitHub Actions — push para \`main\` deploya staging, tag \`v*\` deploya produção.
READMEEOF

ok "README atualizado"

# ------------------------------------------------------------------
# 8. Reset git
# ------------------------------------------------------------------
echo ""
read -rp "$(echo -e "${YELLOW}?${NC}") Resetar histórico git? (y/N): " RESET_GIT

if [[ "$RESET_GIT" == "y" || "$RESET_GIT" == "Y" ]]; then
  log "Resetando git..."
  rm -rf .git
  git init
  git add -A
  git commit -m "chore: init ${PRODUCT_NAME} from saas-template"
  ok "Git resetado com commit inicial"
else
  warn "Git mantido — lembre de commitar as mudanças"
fi

# ------------------------------------------------------------------
# 9. Reinstall deps
# ------------------------------------------------------------------
echo ""
read -rp "$(echo -e "${BLUE}?${NC}") Reinstalar dependências? (Y/n): " REINSTALL

if [[ "$REINSTALL" != "n" && "$REINSTALL" != "N" ]]; then
  log "Removendo node_modules e reinstalando..."
  rm -rf node_modules apps/web/node_modules apps/api/node_modules packages/shared/node_modules pnpm-lock.yaml
  pnpm install
  ok "Dependências instaladas"
fi

# ------------------------------------------------------------------
# 10. Self-destruct
# ------------------------------------------------------------------
log "Removendo script de init..."
rm -f "$SCRIPT_DIR/init-template.sh"
ok "Script removido"

# ------------------------------------------------------------------
# Done
# ------------------------------------------------------------------
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}  ✓ ${COMPANY_NAME} está pronto!${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Próximos passos:"
echo -e "  ${BLUE}1.${NC} Trocar ${BOLD}apps/web/public/logo.svg${NC} pelo logo do produto"
echo -e "  ${BLUE}2.${NC} Editar ${BOLD}.env${NC} com valores reais"
echo -e "  ${BLUE}3.${NC} Rodar ${BOLD}pnpm dev${NC} e verificar"
echo -e "  ${BLUE}4.${NC} Configurar repositório remoto e push"
echo ""
