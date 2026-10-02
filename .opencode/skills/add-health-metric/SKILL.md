---
name: add-health-metric
description: "Guia completo passo a passo para adicionar uma nova métrica vital ou tipo de dado clínico ao HealthTrack (ex.: Sono, Oxigenação SpO2, Frequência Cardíaca, Hidratação) seguindo estritamente a Clean Architecture."
---

# 🩺 Skill: Adicionar Nova Métrica Clínica ao HealthTrack

Esta skill orienta o agente OpenCode ou desenvolvedor na adição de uma nova métrica de saúde ao **HealthTrack**. O projeto segue a **Clean Architecture**, o que significa que o fluxo de implementação deve respeitar rigorosamente a separação de camadas, iniciando no Domínio e culminando na Apresentação e Relatórios.

---

## 📋 Checklist das 9 Etapas Obrigatórias

Ao adicionar qualquer nova métrica (exemplo: **Sono / SleepLog**):

- [ ] **Etapa 1:** Criar a Entidade pura em `src/domain/entities.ts`
- [ ] **Etapa 2:** Implementar as Regras e Classificações Clínicas em `src/domain/services/HealthClassificationService.ts`
- [ ] **Etapa 3:** Definir a Interface do Repositório (Porta) em `src/domain/repositories/interfaces.ts`
- [ ] **Etapa 4:** Adicionar os Métodos do Caso de Uso em `src/use-cases/HealthMetricUseCases.ts`
- [ ] **Etapa 5:** Implementar a Persistência nos Repositórios (`LocalStorageHealthRepository.ts`, `PrismaHealthRepository.ts` e `prisma/schema.prisma`)
- [ ] **Etapa 6:** Criar o Modal de Inserção/Edição em `src/components/crud/[Nome]Modal.tsx`
- [ ] **Etapa 7:** Integrar a Métrica no `src/components/DashboardView.tsx` (Card no Dashboard, Aba de CRUD, Gráfico Chart.js e Tabela de Histórico)
- [ ] **Etapa 8:** Adicionar a Métrica aos Laudos Médicos em PDF e Planilhas Excel em `src/use-cases/ReportExportService.ts` e `src/components/ReportModal.tsx`
- [ ] **Etapa 9:** Escrever os Testes Unitários de Domínio em `src/tests/domain-rules.test.ts` e registrar no `src/components/TestRunnerModal.tsx`

---

## 🔬 Exemplo Prático Completo: Adicionando a Métrica de "Sono" (SleepLog)

Abaixo estão os modelos de código exatos para cada etapa usando **Sono** como referência:

### Etapa 1: Entidade no Domínio (`src/domain/entities.ts`)
```typescript
export type SleepQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface SleepLog {
  id: string;
  userId: string;
  durationMinutes: number; // Duração total em minutos (ex: 480 = 8h)
  quality: SleepQuality;   // Qualidade subjetiva percebida
  deepSleepMinutes?: number; // Sono profundo opcional
  remSleepMinutes?: number;  // Sono REM opcional
  measuredAt: string;      // ISO 8601 da data/hora ao acordar
  notes?: string;          // Observações sobre insônia, despertares, etc.
}
```

### Etapa 2: Regras Clínicas (`src/domain/services/HealthClassificationService.ts`)
Classificação clínica conforme a **National Sleep Foundation** e **Associação Brasileira do Sono**:
- **Sono Muito Curto:** < 360 minutos (< 6h) — Risco cardiovascular e metabólico elevado.
- **Sono Curto:** 360 a 419 minutos (6h a 6h59) — Abaixo do recomendado para adultos.
- **Sono Ideal:** 420 a 540 minutos (7h a 9h) — Faixa saudável recomendada.
- **Sono Prolongado:** > 540 minutos (> 9h) — Hipersônia ou necessidade de investigação.

```typescript
export interface SleepClassification {
  category: string;
  hours: number;
  minutes: number;
  color: string;
  description: string;
}

static classifySleep(durationMinutes: number): SleepClassification {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (durationMinutes < 360) {
    return {
      category: 'Privação de Sono / Curto',
      hours,
      minutes,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      description: 'Menos de 6h de sono. Risco aumentado de estresse metabólico e fadiga diurna.',
    };
  }
  if (durationMinutes < 420) {
    return {
      category: 'Sono Limítrofe',
      hours,
      minutes,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Entre 6h e 7h. Ligeiramente abaixo do ideal recomendado para adultos.',
    };
  }
  if (durationMinutes <= 540) {
    return {
      category: 'Sono Ideal',
      hours,
      minutes,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Faixa recomendada (7h a 9h) para recuperação física e cognitiva adequada.',
    };
  }
  return {
    category: 'Sono Prolongado',
    hours,
    minutes,
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Mais de 9h de sono. Avaliar possíveis episódios de hipersônia ou cansaço acumulado.',
  };
}
```

### Etapa 3: Interface do Repositório (`src/domain/repositories/interfaces.ts`)
```typescript
export interface ISleepRepository {
  findById(id: string): Promise<SleepLog | null>;
  findByUserId(userId: string): Promise<SleepLog[]>;
  create(log: Omit<SleepLog, 'id'>): Promise<SleepLog>;
  update(id: string, log: Partial<SleepLog>): Promise<SleepLog>;
  delete(id: string): Promise<void>;
}
```

### Etapa 4: Caso de Uso (`src/use-cases/HealthMetricUseCases.ts`)
Adicione o repositório ao construtor de `HealthMetricUseCases` e crie os métodos:
```typescript
async listSleep(userId: string): Promise<SleepLog[]> {
  const logs = await this.sleepRepo.findByUserId(userId);
  return logs.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
}

async addSleep(data: Omit<SleepLog, 'id'>): Promise<SleepLog> {
  if (data.durationMinutes <= 0 || data.durationMinutes > 1440) {
    throw new Error('Duração do sono inválida (deve ser entre 1 minuto e 24 horas).');
  }
  return this.sleepRepo.create(data);
}

async updateSleep(id: string, data: Partial<SleepLog>): Promise<SleepLog> {
  return this.sleepRepo.update(id, data);
}

async deleteSleep(id: string): Promise<void> {
  return this.sleepRepo.delete(id);
}
```

### Etapa 5: Implementação dos Repositórios
1. **LocalStorage (`src/repositories/LocalStorageHealthRepository.ts`):**
   - Criar `LocalStorageSleepRepository implements ISleepRepository` usando chave `healthtrack_sleep_logs`.
   - Adicionar dados de semente (seed) na conta demo de Carlos Silva.
2. **Prisma (`prisma/schema.prisma` & `PrismaHealthRepository.ts`):**
   - Declarar modelo `model SleepLog` relacionado a `User` (a conexão de banco é configurada em `prisma.config.ts`).

### Etapa 6: Modal de Inserção/Edição (`src/components/crud/SleepModal.tsx`)
Criar o formulário responsivo com campos:
- Data e Hora do despertar (`measuredAt`)
- Horas e Minutos dormidos (com conversão para `durationMinutes`)
- Qualidade percebida (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`)
- Observações

### Etapa 7: Apresentação no `src/components/DashboardView.tsx`
1. Adicionar o estado: `const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);`
2. Adicionar o Card de Resumo no Dashboard Diário (Média de horas dormidas, última noite e badge de classificação).
3. Adicionar uma nova aba de navegação: `Sono (${sleepLogs.length})`.
4. Incluir gráfico de barras/linhas no Chart.js mostrando horas por noite.
5. Incluir tabela completa com botões de Editar e Excluir.

### Etapa 8: Laudo Médico e Exportação Excel
1. Em `src/use-cases/ReportExportService.ts`:
   - Adicionar linhas no CSV: `DATA;HORA;DURAÇÃO_HORAS;QUALIDADE;CLASSIFICAÇÃO;OBSERVAÇÕES`
2. Em `src/components/ReportModal.tsx`:
   - Exibir tabela e bloco de resumo clínico de sono no Laudo PDF imprimível.

### Etapa 9: Testes Automatizados (`src/tests/domain-rules.test.ts`)
```typescript
test('Classificação de Sono - Menos de 6h deve categorizar como Privação', () => {
  const result = HealthClassificationService.classifySleep(300); // 5 horas
  expect(result.category).toContain('Curto');
});

test('Classificação de Sono - 8h deve categorizar como Sono Ideal', () => {
  const result = HealthClassificationService.classifySleep(480); // 8 horas
  expect(result.category).toBe('Sono Ideal');
});
```

---

## ⚠️ Regras Mandatórias ao Executar esta Skill
1. **NUNCA quebre a Clean Architecture**: Não importe React no domínio.
2. **Valide Tipos**: Execute sempre `npm run lint` ao finalizar.
3. **Mantenha os Testes Verdes**: Execute a suíte de testes de domínio para garantir conformidade médica.
