---
description: "Executa verificação estrita de tipagem TypeScript e testes das regras de negócio clínicas (SBC, SBD, OMS) do HealthTrack."
---

# Comando: `/test-domain`

Executa a validação das regras clínicas e a verificação arquitetural do projeto.

## Passos Executados:

1. **Validação de Tipos TypeScript:**
   Executa `npm run lint` (`tsc --noEmit`) para garantir que não há erros de tipagem em nenhuma camada.

2. **Auditoria de Regras do Domínio:**
   Verifica se todas as regras de classificação clínica estão cobertas por testes em `src/tests/domain-rules.test.ts`:
   - Glicemia: hipoglicemia (<70), jejum (70-99, 100-125, ≥126) e pós-prandial (<140, 140-199, ≥200).
   - Pressão Arterial: as 6 categorias (Ótima, Normal, Pré-hipertensão, Estágio 1, Estágio 2, Crise) e validação da inversão física (PAS > PAD).
   - IMC: cálculo de peso / altura² e classificação segundo tabela da OMS.

3. **Verificação de Pureza:**
   Verifica se `src/domain/` não contém nenhuma importação de React ou bibliotecas externas.

Relate o resultado com status visual (✅ Sucesso / ❌ Erro).
