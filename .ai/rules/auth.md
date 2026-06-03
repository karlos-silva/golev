---
scope: auth
globs: "apps/api/src/modules/auth/**"
---

# Auth Rules

## Estratégia
- JWT custom com NestJS (sem serviços externos)
- Access token: 15min, stateless, contém userId, role
- Refresh token: 7 dias, hash no DB, rotation obrigatória
- Token blocklist: tabela PostgreSQL para logout/revogação

## Segurança
- Password: mínimo 8 chars, sem maxLength artificial, argon2id
- Rate limiting: 5 tentativas/min por IP em login/register/refresh
- Security headers: Helmet no Fastify (`@fastify/helmet` no bootstrap)
- CORS: `ALLOWED_ORIGINS` na API (lista), ver `allowed-origins.ts` e backend rules

## Estrutura do Módulo
- `auth.service.ts` — Coordena login, register, refresh, logout
- `token.service.ts` — Gera e valida JWT
- `password.service.ts` — Hash/verify com argon2
- `guards/jwt-auth.guard.ts` — Valida access token
- `guards/roles.guard.ts` — Verifica roles
- `decorators/current-user.decorator.ts` — Extrai user do request
- `decorators/public.decorator.ts` — Marca rota como pública
- `decorators/roles.decorator.ts` — Define roles necessários

## Sempre
- Rota pública marcada com `@Public()`
- Usar `@CurrentUser()` para acessar dados do usuário
- Refresh token rotation em cada uso
- Revogar todos os refresh tokens no logout
