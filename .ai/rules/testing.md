---
scope: testing
globs: "**/*.test.ts,**/*.spec.ts"
---

# Testing Rules

## Ferramentas
- Unit/Integration: Vitest
- Component: Vitest + Testing Library
- E2E: Playwright

## Sempre
- Testar regras de negócio e fluxos críticos
- Usar `describe` + `it` para organização
- Mocks apenas quando necessário
- Nomear testes descritivamente

## Nunca
- Forçar % de cobertura arbitrário
- Testar implementação interna
- Deixar testes com side effects entre si

## Unit Tests
- Services, utils, schemas, pure functions
- Mockar dependências externas

## Integration Tests
- Controllers + DB
- Usar banco efêmero ou transações com rollback

## E2E
- Fluxos críticos: login, billing, CRUD principal
- Playwright com page objects
