# Deploy — VPS + Docker + Caddy + Cloudflare CDN + Infisical

Arquitetura em produção:

```
Internet → Cloudflare (TLS de borda + CDN) → VPS:443 → Caddy → web:3000
                                                              └→ api:3333  (api.dominio)

Secrets: Infisical Cloud  ──run-time──▶  infisical export → .env → docker compose
                          ──build-time─▶  Infisical/secrets-action → build args (NEXT_PUBLIC_*)
```

- **Cloudflare**: TLS de borda + cache/CDN grátis (proxy laranja ligado).
- **Caddy**: reverse proxy no VPS, apresenta o **Cloudflare Origin Certificate** (15 anos). Sem Let's Encrypt — evita a quebra do challenge HTTP-01 atrás do proxy do CF.
- **Infisical Cloud**: fonte única dos secrets. Nada de `.env` editado à mão no VPS — o `.env` é **gerado** no deploy.
- **web/api/db**: containers; imagens publicadas no GHCR pelo `.github/workflows/deploy.yml`.

---

## 1. Infisical (uma vez)

1. Crie a conta em [app.infisical.com](https://app.infisical.com) e um **Project** (ex.: `golev`).
2. No projeto, no environment **prod** (e **staging** se usar), cadastre as chaves listadas
   em [`.env.production.example`](.env.production.example) — DB, JWT, `DOMAIN`, `GHCR_OWNER=go-lev`,
   `NEXT_PUBLIC_*`, etc.
3. Crie uma **Machine Identity** (Universal Auth) com acesso de leitura ao projeto:
   Organization → Access Control → Machine Identities. Guarde o **Client ID** e **Client Secret**.
4. Anote o **Project ID** (UUID, em Project Settings) e o **Project Slug** (na URL).

## 2. VPS (uma vez)

Ubuntu 22.04+. Docker + compose plugin + **Infisical CLI**:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # relogar depois
# Infisical CLI
curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

Diretório do deploy + arquivos de infra:

```bash
mkdir -p ~/apps/saas/production/caddy/certs
# copie para ~/apps/saas/production/:
#   infra/docker-compose.prod.yml  → docker-compose.yml
#   infra/caddy/Caddyfile          → caddy/Caddyfile
# (NÃO precisa criar .env à mão — o deploy gera via infisical export)
```

> O `deploy.yml` faz `cd ~/apps/saas/production && docker compose ...`, então o compose
> precisa se chamar `docker-compose.yml` (ou `compose.yaml`) nesse diretório.

Login no GHCR (imagens privadas precisam de um PAT com `read:packages`):

```bash
echo $GHCR_PAT | docker login ghcr.io -u <seu-usuario> --password-stdin
```

## 3. Cloudflare

1. Adicione o domínio no Cloudflare e troque os nameservers no registrador.
2. **DNS** → registros **A** (proxy laranja LIGADO):
   - `seudominio.com.br` → IP do VPS
   - `api` → IP do VPS
3. **SSL/TLS → Overview** → modo **Full (strict)**.
4. **SSL/TLS → Origin Server → Create Certificate** → gere um Origin Certificate
   (hostnames `seudominio.com.br` e `*.seudominio.com.br`). Salve no VPS:
   - certificado → `~/apps/saas/production/caddy/certs/origin.pem`
   - chave privada → `~/apps/saas/production/caddy/certs/origin.key`
   ```bash
   chmod 600 ~/apps/saas/production/caddy/certs/origin.key
   ```

## 4. GitHub — Secrets e Variables

Repo → **Settings → Secrets and variables → Actions**:

**Secrets** (sensíveis):

| Secret                    | Valor                                   |
|---------------------------|-----------------------------------------|
| `VPS_HOST`                | IP do VPS                               |
| `VPS_USER`                | usuário SSH                             |
| `VPS_SSH_KEY`             | chave privada SSH                       |
| `INFISICAL_CLIENT_ID`     | Client ID da Machine Identity           |
| `INFISICAL_CLIENT_SECRET` | Client Secret da Machine Identity       |

**Variables** (não sensíveis):

| Variable                          | Valor                                  |
|-----------------------------------|----------------------------------------|
| `INFISICAL_PROJECT_ID`            | Project ID (UUID) — usado pela CLI      |
| `INFISICAL_PROJECT_SLUG`          | Project Slug — usado pela secrets-action|
| `AUTO_DEPLOY_PRODUCTION_ON_MAIN`  | `true` para deploy automático em `main` (opcional) |

Sem `AUTO_DEPLOY_PRODUCTION_ON_MAIN`, produção roda em push de tag `v*` ou via
**Actions → Deploy → Run workflow** (workflow_dispatch).

## 5. Como o deploy usa o Infisical

- **Build (CI)**: o step `Fetch build secrets from Infisical` puxa o env (`prod`/`staging`)
  e injeta as `NEXT_PUBLIC_*`, que entram como `build-args` na imagem web.
- **Run-time (VPS)**: o step de deploy faz, via SSH:
  ```bash
  INFISICAL_TOKEN=$(infisical login --method=universal-auth \
    --client-id=$INFISICAL_CLIENT_ID --client-secret=$INFISICAL_CLIENT_SECRET --plain --silent)
  infisical export --token=$INFISICAL_TOKEN --projectId=$INFISICAL_PROJECT_ID \
    --env=prod --format=dotenv > .env
  docker compose pull && docker compose run --rm api npx drizzle-kit migrate && docker compose up -d
  ```
  Os serviços (`caddy`, `web`, `api`, `db`) leem esse `.env` via `env_file`.

## 6. Deploy

- **Automático**: push em `main` (com `AUTO_DEPLOY_PRODUCTION_ON_MAIN=true`) ou tag `v*`.
- **Manual/teste**: Actions → Deploy → Run (escolha `staging`/`production`).

Para validar manualmente no VPS antes de automatizar, rode os comandos da seção 5 na mão.

---

## Notas

- **`NEXT_PUBLIC_*` são build-time**: ficam embutidas no bundle do cliente no `next build`.
  Por isso vêm do Infisical no **CI** (não no `.env` do runtime). Staging e produção geram
  imagens web diferentes (o `env-slug` segue o alvo do deploy).
- **CDN**: `/_next/static/*` já tem `Cache-Control: immutable` (1 ano) no Caddy → Cloudflare
  cacheia na borda. HTML dinâmico não é cacheado por padrão (correto).
- **Quotes no .env gerado**: o `infisical export --format=dotenv` emite `KEY='valor'`. O
  Docker Compose v2 interpreta aspas em `env_file` — se sua versão for antiga, atualize o
  compose plugin.
