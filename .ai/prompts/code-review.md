# Code Review Prompt

Revise o código a seguir contra as regras do projeto Go Lev:

1. Leia `.ai/rules/global.md` para regras universais
2. Leia a rule específica do contexto (backend, frontend, drizzle, etc.)
3. Verifique:
   - TypeScript strict, sem `any`
   - Tipos de `@golev/shared`
   - Validação com Zod
   - Camadas respeitadas (controller vs service)
   - Naming conventions
4. Liste problemas encontrados com severidade (critical, warning, suggestion)
5. Sugira correções concretas
