---
scope: backend
globs: "apps/api/**"
---

# Backend Rules

## Arquitetura
- Layered pragmático: Controller → Service → Drizzle
- Sem Clean Architecture, sem Repository Pattern
- Controller: recebe HTTP, valida com Zod, delega para Service, retorna response
- Service: regra de negócio, acessa Drizzle diretamente, coordena transações
- Guard: autorização (roles, permissions)
- Interceptor: cross-cutting (logging, timing, transform)

## Sempre
- Usar NestJS + Fastify (não Express)
- Escutar em `0.0.0.0` para funcionar em Docker
- CORS: origens via `ALLOWED_ORIGINS` (vírgula) — `apps/api/src/config/allowed-origins.ts` + §3.5 da arquitetura; alinhar à URL pública do Next em cada ambiente
- `bodyLimit` do Fastify via `REQUEST_BODY_LIMIT_BYTES` quando necessário (default no template)
- Usar Helmet (`@fastify/helmet`) no bootstrap
- Validar input com Zod no controller (não com class-validator)
- Injetar Drizzle via `@Inject('DATABASE')`
- Usar transactions para operações multi-tabela
- Rate limiting em endpoints públicos

## Nunca
- Controller com regra de negócio
- Service acessando request/response HTTP
- `class-validator` ou `class-transformer`
- Criar DTOs internos — Zod schemas em shared são os contratos
- Criar Mapper/Presenter classes
