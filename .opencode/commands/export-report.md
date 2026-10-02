---
description: "Audita e valida a lógica de exportação de laudos médicos em PDF e planilhas Excel (CSV UTF-8 com BOM)."
---

# Comando: `/export-report`

Audita e valida os serviços de exportação médica (`ReportExportService.ts` e `ReportModal.tsx`).

## Verificações Realizadas:

1. **Planilha Excel (CSV UTF-8 BOM):**
   - Confirma a presença do caractere BOM (`\uFEFF`) para evitar caracteres corrompidos no Excel em português.
   - Confirma o delimitador ponto-e-vírgula (`;`).
   - Verifica se todas as métricas ativas (Glicose, Pressão, Peso, Altura, IMC) possuem colunas devidamente mapeadas com datas legíveis.

2. **Laudo Médico PDF:**
   - Verifica se o componente `ReportModal.tsx` exibe os dados consolidados do paciente:
     - Identificação (Nome, E-mail)
     - Médias do período e extremos (mín/máx)
     - Classificações clínicas das diretrizes SBD, SBC e OMS
   - Garante que a formatação de impressão `@media print` oculte elementos de navegação e mantenha a visualização nítida.
