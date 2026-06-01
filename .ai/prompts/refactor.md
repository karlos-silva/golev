# Refactor Prompt

Refatore o código seguindo estas diretrizes:

1. Mantenha a arquitetura layered pragmática
2. Não introduza abstrações desnecessárias
3. Split services quando ultrapassarem ~200 linhas
4. Mova tipos compartilhados para `packages/shared`
5. Mantenha tenant isolation
6. Verifique que TypeScript compila após refatoração
7. Atualize testes se necessário
