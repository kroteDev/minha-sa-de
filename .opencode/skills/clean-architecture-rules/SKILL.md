---
name: clean-architecture-rules
description: "Diretrizes e regras arquiteturais invioláveis da Clean Architecture para o HealthTrack. Define restrições de importações entre camadas, contratos de repositório e pureza do domínio."
---

# 🏛️ Skill: Diretrizes de Clean Architecture do HealthTrack

Esta skill define as restrições arquiteturais que devem ser preservadas em qualquer refatoração, extensão ou criação de novas funcionalidades no repositório.

---

## 🏗️ As 4 Camadas Arquiteturais

```
src/
├── domain/                      # CAMADA 1: Regras Clínicas e Entidades (Puro TypeScript)
│   ├── entities.ts              # Tipos e estruturas de dados vitais
│   ├── services/                # Classificadores clínicos (SBC, SBD, OMS)
│   └── repositories/            # Contratos de persistência (Interfaces/Portas)
│
├── use-cases/                   # CAMADA 2: Casos de Uso (Orquestração de negócio)
│   ├── AuthUseCases.ts          # Fluxos de login, cadastro e validação de sessão
│   ├── HealthMetricUseCases.ts  # CRUD de métricas vitais e agregações temporais
│   └── ReportExportService.ts   # Transformação de dados em Laudo PDF e Excel
│
├── repositories/                # CAMADA 3: Adaptadores de Infraestrutura
│   ├── LocalStorageHealthRepository.ts # Adaptador offline-first persistente para local/demo
│   └── PrismaHealthRepository.ts       # Adaptador PostgreSQL para servidor de produção
│
└── components/                  # CAMADA 4: Apresentação & UI
    ├── LandingPage.tsx          # Página pública com Hero Banner e CTAs de conversão
    ├── DashboardView.tsx        # Área autenticada e protegida com métricas
    ├── LoginView.tsx            # Autenticação com redirecionamento seguro
    ├── HealthChart.tsx          # Gráficos com Chart.js
    ├── ReportModal.tsx          # Laudo médico imprimível
    ├── TestRunnerModal.tsx      # Executor de testes unitários do domínio
    └── crud/                    # Modais de inserção e edição
```

---

## 🚫 Regras Rígidas de Importação (Inversão de Dependência)

1. **Pureza do Domínio (`src/domain/`)**:
   - ❌ **PROIBIDO**: Importar `react`, `react-dom`, `@prisma/client`, `chart.js` ou qualquer biblioteca de terceiros.
   - ✅ **PERMITIDO**: Apenas TypeScript puro e utilitários nativos de JavaScript.
   - O domínio não sabe o que é banco de dados, nem o que é tela ou navegador.

2. **Isolamento dos Casos de Uso (`src/use-cases/`)**:
   - Os UseCases dependem apenas de contratos do domínio (`src/domain/repositories/interfaces.ts`) e das entidades (`src/domain/entities.ts`).
   - UseCases orquestram operações (adicionar, listar, calcular médias, validar limites fisiológicos).

3. **Repositórios e Adaptadores (`src/repositories/`)**:
   - Implementam as interfaces definidas em `src/domain/repositories/interfaces.ts`.
   - Podem usar `localStorage`, `Prisma`, `IndexedDB` ou APIs REST.

4. **Componentes de UI (`src/components/`)**:
   - Consomem os UseCases para ler e modificar dados.
   - Não devem manipular diretamente banco de dados ou consultas SQL.

---

## 🧪 Como Validar a Integridade Arquitetural

Execute os seguintes comandos para garantir que não houve violação de fronteiras:

```bash
# Valida a tipagem estrita de TypeScript
npm run lint

# Executa testes unitários das regras de domínio
npm test
```
