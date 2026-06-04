---
name: deploy
description: Operar o deploy de produção, previews efêmeros e acesso ao banco de prod. Veja .ai/context/DEPLOYMENT.md para entender a arquitetura.
---

# Deploy & Operação

Pré-requisito de contexto: leia `.ai/context/DEPLOYMENT.md`.

## Deploy de produção

Manual (a "aprovação" é o clique em Run workflow):

```bash
# via CLI
gh workflow run deploy.yml -R go-lev/plataform --ref main -f git_ref=main
# acompanhar
gh run watch "$(gh run list -R go-lev/plataform --workflow=deploy.yml -L1 --json databaseId -q '.[0].databaseId')" --exit-status
```
Ou: GitHub → Actions → **Deploy** → *Run workflow* → branch `main`.

O job `build-and-push` roda no runner do GitHub; o `deploy-production` roda no **runner self-hosted** (local no VPS): gera `.env` do Infisical, `docker compose pull`, migra, `up -d`.

Validar pós-deploy:
```bash
curl -s -o /dev/null -w '%{http_code}\n' https://golev.app.br          # 200
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://api.golev.app.br/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"x@x.com","password":"senhaValida123"}'  # 401
```

## Preview efêmero (opt-in por PR)

- Adicionar a label **`preview`** no PR → builda e sobe `front + back + banco isolado` em `https://preview.golev.app.br` (noindex, descartável).
- Remover a label ou fechar o PR → derruba e libera o VPS.
- Slot único: um preview por vez (o novo substitui o anterior).

## Acesso ao banco de produção

Postgres não é exposto na internet — só via túnel SSH (alias `golev-db` no `~/.ssh/config`, `LocalForward 5433 → 127.0.0.1:5432`).

- **Olhada rápida (terminal, sem senha, via trust local):**
  ```bash
  ssh golev-vps "cd /opt/golev/production && docker compose exec db psql -U golev -d golev_pg"
  ```
- **GUI (DataGrip — recomendado, túnel SSH embutido):** Data Source PostgreSQL → General: Host `127.0.0.1`, Port `5432`, User `golev`, DB `golev_pg`, senha do `.env`; aba SSH/SSL → Use SSH tunnel → `<IP_DA_VPS>:22`, user `root`, key `~/.ssh/golev_vps`. (DataGrip abre/fecha o túnel sob demanda.)
- **Senha real do banco** (a que o banco aceita, não necessariamente a do Infisical): `ssh golev-vps "grep POSTGRES_PASSWORD /opt/golev/production/.env"`.

## Rollback

As imagens são tagueadas também com o SHA. Pra voltar:
```bash
# no VPS, em /opt/golev/production, com IMAGE_TAG=<sha-anterior>
ssh golev-vps "cd /opt/golev/production && IMAGE_TAG=<SHA> docker compose up -d"
```
(ou re-disparar o deploy a partir de uma tag/commit anterior via `git_ref`).

## Troubleshooting

- **`28P01 password authentication failed`** → descasamento Infisical ↔ banco (ver gotcha #3 em DEPLOYMENT.md). Use a senha real do `.env` do VPS, ou alinhe o Infisical / `ALTER ROLE`.
- **Deploy falha em `dial tcp ...:22 i/o timeout`** → era o problema do SSH de entrada; o deploy agora roda no self-hosted runner. Se acontecer, **re-run failed jobs**.
- **Runner offline** (`gh api repos/go-lev/plataform/actions/runners`) → no VPS: `cd /opt/actions-runner && sudo ./svc.sh status` / `start`.
- **CI vermelha no `audit`** → CVEs sem fix vão em `pnpm.auditConfig.ignoreGhsas` no `package.json`.
- **Caddy/preview 502** → container alvo não está no ar (preview derrubado, ou prod recriando). Normal quando não há preview ativo.

## Mudar infra (compose/Caddyfile)
Não é puxado do git pelo deploy. Depois de mudar `infra/docker-compose.prod.yml` ou `infra/caddy/Caddyfile`:
```bash
scp infra/docker-compose.prod.yml golev-vps:/opt/golev/production/docker-compose.yml
scp infra/caddy/Caddyfile          golev-vps:/opt/golev/production/caddy/Caddyfile
ssh golev-vps "cd /opt/golev/production && docker compose up -d"
```
