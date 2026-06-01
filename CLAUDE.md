# CLAUDE.md

Este projeto segue o padrão Trianox de arquitetura SaaS.

Para todas as regras e guidelines, leia `.ai/AGENTS.md` como ponto de entrada.

## Regras Críticas

- TypeScript strict, sem `any`
- Validar inputs com Zod
- Tipos de `@trianox/shared`
- Tenant isolation em toda query
- Controller sem regra de negócio
- Sem Repository/Use Case/Domain Entity classes
- Drizzle é o data access layer
- Conventional Commits

## Detalhes

- Regras: `.ai/rules/`
- Skills: `.ai/skills/`
- Agentes: `.ai/agents/`
