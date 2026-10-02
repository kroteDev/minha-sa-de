---
description: "Cria e registra uma nova métrica vital ou tipo de dado clínico no HealthTrack seguindo Clean Architecture (ex: sono, oxigenação, hidratação)."
---

# Comando: `/add-metric [nome-da-metrica]`

Você é o assistente técnico especializado no **HealthTrack**. O usuário solicitou a adição de uma nova métrica clínica ao sistema.

## Parâmetros
- `$1`: Nome da métrica a ser adicionada (exemplo: `sono`, `spo2`, `hidratacao`, `frequencia_cardiaca`). Se não fornecido, pergunte ao usuário qual métrica ele deseja adicionar e quais são os parâmetros clínicos desejados.

## Procedimento de Execução Obrigatório
Siga a skill **`add-health-metric`** e execute rigorosamente os 9 passos:

1. **Domínio - Entidade:**
   - Adicione a interface em `src/domain/entities.ts` com ID, userId, campos clínicos e measuredAt.
2. **Domínio - Regras Clínicas:**
   - Adicione a classificação médica em `src/domain/services/HealthClassificationService.ts` com base nas sociedades médicas de referência.
3. **Domínio - Repositório (Porta):**
   - Declare a interface `I[Nome]Repository` em `src/domain/repositories/interfaces.ts`.
4. **Casos de Uso:**
   - Atualize `src/use-cases/HealthMetricUseCases.ts` com os métodos de listagem, inserção, atualização e exclusão com validação fisiológica.
5. **Infraestrutura - Repositórios:**
   - Atualize `src/repositories/LocalStorageHealthRepository.ts` e `src/repositories/PrismaHealthRepository.ts` com suporte à persistência.
6. **Interface - Modal de CRUD:**
   - Crie `src/components/crud/[Nome]Modal.tsx` com validações de formulário e design acessível.
7. **Interface - Painel do Usuário:**
   - Adicione a métrica ao `src/components/DashboardView.tsx` (card de telemetria, aba de CRUD dedicada, histórico com Chart.js e tabela).
8. **Relatórios Médicos:**
   - Inclua os novos dados no `src/use-cases/ReportExportService.ts` (planilha Excel) e no `src/components/ReportModal.tsx` (Laudo PDF).
9. **Testes Unitários:**
   - Escreva testes unitários para a regra clínica em `src/tests/domain-rules.test.ts`.

Por fim, execute `npm run lint` para garantir 0 erros de tipagem.
