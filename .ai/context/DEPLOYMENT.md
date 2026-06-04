# Deployment & Infraestrutura

Como a aplicação Go Lev roda em produção e como o deploy funciona. Leia isto
antes de mexer em deploy, infra, CI/CD, secrets ou acesso ao banco de prod.

## Visão geral

```
Internet → Cloudflare (CDN + TLS de borda) → VPS (Docker) → Caddy → web (Next) + api (NestJS) + Postgres
```

- **VPS:** Hostinger KVM em **São Paulo**. IP `<IP_DA_VPS>`. Domínio `golev.app.br`.
- **Cloudflare:** proxy/CDN + TLS de borda. Modo SSL **Full (strict)**, com **Origin Certificate** (15 anos) no Caddy. DNS (todos *proxied*): `golev.app.br`, `www`, `api`, `preview`, `api-preview` → IP do VPS.
- **Orquestração:** Docker Compose no VPS.
- **Imagens:** GHCR — `ghcr.io/go-lev/golev-plataform-web` e `-api`. Buildadas no CI.
- **Secrets:** Infisical Cloud (não há `.env` versionado nem editado à mão em prod).
- **CI/CD:** GitHub Actions + **runner self-hosted** no VPS.

## Caminhos no VPS

| Caminho | O quê |
|---|---|
| `/opt/golev/production/` | Stack de produção: `docker-compose.yml`, `caddy/Caddyfile`, `caddy/certs/`, `.env` (gerado) |
| `/opt/golev/preview/` | Stack de preview efêmero |
| `/opt/actions-runner/` | GitHub Actions runner self-hosted (roda como usuário `gha-runner`, não-root, no grupo docker) |

> Os arquivos de infra (compose, Caddyfile, certs) são colocados no VPS via `scp` na configuração inicial — o deploy **não** os re-sincroniza do git. Se mudar `infra/docker-compose.prod.yml` ou o `Caddyfile`, precisa re-`scp` pro VPS e `docker compose up -d`.

## Componentes

### Caddy (`infra/caddy/Caddyfile`)
Reverse proxy + TLS de origem (Origin Cert). Rotas:
- `golev.app.br` → `web:3000` (cache de 1 ano em `/_next/static`)
- `api.golev.app.br` → `api:3333`
- `preview.golev.app.br` → `preview-web:3000` (header `X-Robots-Tag: noindex` — **preview nunca é indexado**)
- `api-preview.golev.app.br` → `preview-api:3333` (noindex)

O Caddy entra na rede externa **`web_edge`** pra alcançar os containers de preview por nome.

### Postgres
Container `db` do compose de prod. Publicado **só no loopback do VPS** (`127.0.0.1:5432`) + firewall (`ufw`) libera só 22/80/443 → **não exposto na internet**. Acesso externo só via túnel SSH (ver skill `deploy`).

### Infisical (secrets)
- Projeto: id `<INFISICAL_PROJECT_ID>`, slug `golev-deploy`. Environments: `dev`, `staging`, `prod`.
- Machine identity **`golev-deploy`** (Universal Auth) — leitura. Usada pelo CI e pelo VPS.
- **Runtime:** o deploy roda `infisical export --env=prod --format=dotenv > .env` e o compose consome via `env_file`.
- **Build-time:** `NEXT_PUBLIC_*` são embutidas no bundle no `next build` (CI) via `Infisical/secrets-action`. **Não** adianta defini-las só em runtime.

### Runner self-hosted
- Runner `golev-vps` no VPS (usuário `gha-runner`). Serviço systemd, reinicia sozinho.
- **Motivo:** o SSH de entrada GitHub→VPS dava timeout intermitente (a Hostinger dropa faixas de IP de runner do GitHub). Com o runner self-hosted, o deploy roda **localmente no VPS** (conexão de saída), sem SSH de entrada → confiável.

## Workflows (`.github/workflows/`)

| Workflow | Quando | O que faz |
|---|---|---|
| `ci.yml` | PR e push na `main` | lint, typecheck, test:unit/integration, build, valida migrations, `pnpm audit` |
| `deploy.yml` | `workflow_dispatch`, tag `v*`, ou push na main (se `AUTO_DEPLOY_PRODUCTION_ON_MAIN=true`) | `build-and-push` (GitHub-hosted) → `deploy-production` (**self-hosted**, local no VPS) |
| `preview.yml` | PR com label **`preview`** | build (hosted) → deploy preview (self-hosted); teardown ao remover a label / fechar o PR |

`deploy.yml` (job `deploy-production`, no runner self-hosted) faz: `infisical export > .env` → `docker login ghcr.io` (com `GITHUB_TOKEN`) → `docker compose pull` → `docker compose run --rm api npx drizzle-kit migrate` → `docker compose up -d`.

## GitHub — Secrets e Variables

**Secrets:** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`.
**Variables:** `INFISICAL_PROJECT_ID`, `INFISICAL_PROJECT_SLUG` (=`golev-deploy`), `AUTO_DEPLOY_PRODUCTION_ON_MAIN`.

## Fluxo de Git / deploy

- **PR-based.** CI roda no PR. Merge na `main` roda a CI (não deploya sozinho).
- **Deploy de produção = manual**, via Actions → *Deploy* → *Run workflow* (esse clique é a "aprovação"). O gate nativo de aprovação (GitHub Environments → required reviewers) **exige plano pago/repo público**, por isso usamos o dispatch manual como aprovação.
- Tag `v*` também deploya (release).

## ⚠️ Gotchas (leia antes de mexer)

1. **`NEXT_PUBLIC_*` são build-time** — mudar só no runtime não afeta o bundle. Precisa rebuildar a imagem web (CI injeta via secrets-action).
2. **Compose/Caddyfile do VPS não vêm do git no deploy** — mudanças em `infra/*` precisam de re-`scp` pro `/opt/golev/production`.
3. **Senha do Postgres só é gravada na 1ª init do volume** — se `POSTGRES_PASSWORD`/`DATABASE_URL` mudarem no Infisical depois, o banco continua com a senha antiga. Hoje **há um descasamento conhecido**: o valor no Infisical ≠ senha real do banco. Isso **quebra o próximo deploy** (a API pega a senha do Infisical e o banco rejeita). Corrigir alinhando o Infisical à senha real do banco (ver `.env` em `/opt/golev/production`) OU rodando `ALTER ROLE golev WITH PASSWORD '...'` + redeploy.
4. **Preview usa credenciais descartáveis** (hardcoded no `infra/docker-compose.preview.yml`, banco isolado) — não usa Infisical nem toca o banco de prod.
5. Se um job de deploy/preview falhar com **`dial tcp ...:22 i/o timeout`** (em runs antigos via SSH): hoje o deploy roda no self-hosted runner, então não deve mais ocorrer. Se ocorrer em algum job que ainda use SSH, basta **re-run**.
