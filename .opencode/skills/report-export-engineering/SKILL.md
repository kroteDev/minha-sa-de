---
name: report-export-engineering
description: "Padrões de engenharia para exportação de laudos médicos em PDF (folha de estilo para impressão e cabeçalhos clínicos) e planilhas Excel (CSV UTF-8 com BOM e delimitador ponto-e-vírgula)."
---

# 📄 Skill: Engenharia de Exportação de Laudos Médicos e Planilhas

Esta skill define as especificações técnicas para a geração de relatórios clínicos em PDF e planilhas no HealthTrack.

---

## 1. Planilha Excel (CSV com UTF-8 BOM)

Para garantir compatibilidade imediata com Microsoft Excel em computadores em língua portuguesa:
- **Encoding:** Deve conter o Byte Order Mark (`\uFEFF`) no início do arquivo para que acentuações não fiquem corrompidas.
- **Delimitador:** Usar ponto e vírgula (`;`), padrão de colunas do Excel no Brasil.
- **Formatação de Decimais:** Substituir ponto por vírgula em números (ex.: `22,8` ao invés de `22.8`).
- **Nomenclatura do Arquivo:** `healthtrack_relatorio_YYYY-MM-DD.csv`.

Exemplo de implementação do gerador:
```typescript
const bom = '\uFEFF';
const csvContent = bom + rows.map(r => r.join(';')).join('\r\n');
const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
```

---

## 2. Laudo Médico Imprimível em PDF

O componente `ReportModal.tsx` funciona como laudo clínico formatado:
- **Cabeçalho Clínico:** Identificação do paciente, e-mail, data de emissão e termo de responsabilidade de monitoramento.
- **Blocos de Resumo Estatístico:**
  - Glicemia: Média, Mínima, Máxima e % de medições dentro do alvo.
  - Pressão: Média sistólica/diastólica e pulso médio.
  - Antropometria: Peso atual, altura, IMC e classificação OMS.
- **Folha de Estilo para Impressão (`@media print`):**
  - Ocultar botões, barras de rolagem e modais de fundo.
  - Forçar quebra de página limpa (`page-break-inside: avoid`).
  - Utilizar `window.print()` do navegador para salvar como PDF nativo de alta qualidade.
