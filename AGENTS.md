# 🤖 AGENTS.md — Diretrizes para Agentes de IA e Desenvolvedores

Bem-vindo ao repositório do **HealthTrack** (Monitor de Saúde Diário). Este arquivo contém as regras arquiteturais, diretrizes de infraestrutura, convenções de código e procedimentos operacionais que **devem ser rigorosamente seguidos** por qualquer agente de inteligência artificial ou desenvolvedor ao ler, modificar ou estender esta base de código.

---

## 📌 1. Visão Geral do Projeto & Princípios Fundamentais

O **HealthTrack** é uma aplicação focada no monitoramento contínuo de métricas vitais:
1. **Glicemia (Glicose)** — Classificação SBD (Sociedade Brasileira de Diabetes) e ADA (American Diabetes Association).
2. **Pressão Arterial** — Classificação SBC (Sociedade Brasileira de Cardiologia) e AHA (American Heart Association).
3. **Peso Corporal e Altura** — Cálculo em tempo real do **IMC** categorizado conforme diretrizes da **OMS (Organização Mundial da Saúde)**.
4. **Histórico Gráfico e Relatórios** — Visualização via Chart.js e exportação de Laudo Médico em PDF e planilha Excel (CSV UTF-8 BOM).

---

## 🚫 2. DIRETRIZ MANDATÓRIA DE INFRAESTRUTURA: SEM VERCEL

> **REGRA ABSOLUTA:**
> - Este projeto **NÃO** será hospedado na Vercel nem em plataformas serverless proprietárias com vendor lock-in.
> - **Ambiente 1 (Local):** Destinado a testes locais, verificação de código, testes unitários e validação funcional imediata.
> - **Ambiente 2 (Servidor Dedicado / VPS):** Destinado à produção em servidor Linux dedicado (ex.: Ubuntu Server 22.04/24.04 LTS ou Debian 12), rodando via **Docker & Docker Compose** ou nativamente com **Nginx + Systemd**.
> - **Variáveis de Ambiente:** Todas as variáveis de ambiente devem ser **estritamente locais**, lidas a partir de arquivos `.env`, `.env.local` ou `.env.production` no próprio servidor/máquina, ou passadas via container/processo do sistema operacional. Nunca assuma painéis em nuvem proprietários.

---

## 🏛️ 3. Clean Architecture (Arquitetura Limpa)

A estrutura do código segue rigorosamente o princípio de separação de responsabilidades e inversão de dependência:

```
src/
├── domain/                      # 1. DOMÍNIO (Independente de frameworks, puro TypeScript)
│   ├── entities.ts              # Entidades fundamentais (User, GlucoseLog, BloodPressureLog, etc.)
│   ├── services/
│   │   └── HealthClassificationService.ts # Regras clínicas (SBC, SBD, OMS) e validações fisiológicas
│   └── repositories/
│       └── interfaces.ts        # Contratos (Portas) de persistência
│
├── use-cases/                   # 2. CASOS DE USO (Orquestração das regras de negócio)
│   ├── AuthUseCases.ts          # Autenticação de usuários e gerenciamento de sessão
│   ├── HealthMetricUseCases.ts  # CRUD de métricas, filtragem temporal e médias agregadas
│   └── ReportExportService.ts   # Emissão de laudo médico em PDF e exportação para Excel
│
├── repositories/                # 3. ADAPTADORES DE INFRAESTRUTURA (Persistência)
│   ├── LocalStorageHealthRepository.ts # Adaptador offline-first persistente para testes locais e demo
│   └── PrismaHealthRepository.ts       # Adaptador PostgreSQL via Prisma para o servidor dedicado
│
├── components/                  # 4. APRESENTAÇÃO / UI
│   ├── LandingPage.tsx          # Página inicial pública com hero banner e CTAs de conversão
│   ├── DashboardView.tsx        # Área segura autenticada do usuário (Métricas e Gráficos)
│   ├── HealthChart.tsx          # Renderizador de gráficos interativos com Chart.js
│   ├── LoginView.tsx            # Autenticação e entrada direta com conta demo
│   ├── ReportModal.tsx          # Modal com laudo médico consolidado imprimível
│   ├── TestRunnerModal.tsx      # Executor visual da suíte de testes unitários do domínio
│   └── crud/                    # Modais de inserção/edição para cada métrica com validação
│
└── tests/                       # 5. TESTES UNITÁRIOS
    └── domain-rules.test.ts     # Suíte de testes automatizados das regras clínicas e cálculos
```

### Regras de Camadas para Agentes:
1. **Nunca importe React, Prisma, ou bibliotecas de UI dentro de `src/domain/`**. O domínio deve permanecer 100% puro.
2. **Novas regras clínicas** (ex.: metas glicêmicas para gestantes ou idosos) devem ser implementadas exclusivamente em `src/domain/services/HealthClassificationService.ts`.
3. **Novas fontes de dados** devem implementar a interface `IHealthRepository` definida em `src/domain/repositories/interfaces.ts`.

---

## 💻 4. Fluxo de Trabalho Local (Testes e Verificação)

Para validar e testar alterações no ambiente local:

### Passo 1: Dependências e Node
- Versão recomendada do Node: **Node 22** (`>= 22.12.0`, ver `.nvmrc`).
```bash
nvm use
npm install
```

### Passo 2: Configuração de Variáveis Locais
Copie o modelo local:
```bash
cp .env.local .env
```

### Passo 3: Execução dos Testes e Validação de Tipos
Sempre execute a validação de tipos TypeScript antes de concluir qualquer alteração:
```bash
npm run lint    # Executa tsc --noEmit
```
Para testar as regras de negócio clínicas, use o painel visual no botão **"Testes de Domínio"** no cabeçalho ou execute os testes unitários.

### Passo 4: Servidor de Desenvolvimento Local
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000). A conta demo (`usuario@saude.com` / `123456`) já contém medições clínicas históricas.

### Passo 5: Teste com Docker Local (Ambiente Idêntico ao de Produção)
```bash
docker compose up -d --build
```
Isso levantará o container do PostgreSQL 16 e o container do aplicativo servido via Nginx na porta `3000`.

---

## 🖥️ 5. Guia de Hospedagem em Servidor Dedicado

Ao preparar ou documentar implantações para servidores dedicados (VPS, Bare Metal, Linux Ubuntu/Debian):

### Opção A: Deploy via Docker Compose (Recomendado)
1. Instale o Docker e o Docker Compose no servidor:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   ```
2. Clone o repositório na pasta de produção (ex.: `/opt/healthtrack`).
3. Configure o arquivo `.env` baseado em `.env.production.example`:
   ```bash
   cp .env.production.example .env
   # Edite as senhas e portas conforme necessário
   nano .env
   ```
4. Execute o script de deploy automatizado:
   ```bash
   chmod +x deploy-dedicated-server.sh
   ./deploy-dedicated-server.sh
   ```

### Opção B: Configuração de Nginx Reverso com SSL (Let's Encrypt)
Copie o arquivo `nginx-dedicated-server.conf` para o diretório do Nginx do servidor:
```bash
sudo cp nginx-dedicated-server.conf /etc/nginx/sites-available/healthtrack.conf
sudo ln -s /etc/nginx/sites-available/healthtrack.conf /etc/nginx/sites-enabled/
sudo certbot --nginx -d seudominio.com.br
sudo nginx -t && sudo systemctl reload nginx
```

### Opção C: Backup Automático do PostgreSQL no Servidor Dedicado
Configure uma tarefa no crontab (`crontab -e`) para backup diário do banco de dados:
```bash
0 3 * * * docker exec healthtrack_postgres pg_dump -U health_prod_user healthtrack_production | gzip > /backups/healthtrack_$(date +\%F).sql.gz
```

---

## 🛡️ 6. Padrões Clínicos e Regras de Validação

Qualquer alteração nas regras de classificação deve respeitar rigorosamente as tabelas abaixo:

### Pressão Arterial (SBC / AHA):
- **Ótima:** Sistólica < 120 E Diastólica < 80 mmHg.
- **Normal:** Sistólica 120–129 E/OU Diastólica 80–84 mmHg.
- **Pré-hipertensão:** Sistólica 130–139 E/OU Diastólica 85–89 mmHg.
- **Hipertensão Estágio 1:** Sistólica 140–159 E/OU Diastólica 90–99 mmHg.
- **Hipertensão Estágio 2:** Sistólica 160–179 E/OU Diastólica 100–109 mmHg.
- **Crise Hipertensiva:** Sistólica ≥ 180 E/OU Diastólica ≥ 110 mmHg.
- **Inversão Fisiológica:** Se PAS ≤ PAD, o sistema deve disparar erro ou alerta imediato (inconsistência física).

### Glicemia (SBD / ADA):
- **Hipoglicemia:** < 70 mg/dL (Alerta vermelho com orientação de conduta imediata).
- **Em Jejum:** Normal: 70–99 mg/dL; Pré-diabetes: 100–125 mg/dL; Diabetes provável: ≥ 126 mg/dL.
- **Pós-refeição:** Normal: < 140 mg/dL; Elevada: 140–199 mg/dL; Diabetes provável: ≥ 200 mg/dL.

### IMC (Organização Mundial da Saúde):
- Fórmula: `Peso (kg) / [Altura (m)]²`
- Categorias:
  - `< 18.5`: Abaixo do peso
  - `18.5 – 24.9`: Peso normal (eutrófico)
  - `25.0 – 29.9`: Sobrepeso (pré-obesidade)
  - `30.0 – 34.9`: Obesidade Grau I
  - `35.0 – 39.9`: Obesidade Grau II
  - `≥ 40.0`: Obesidade Grau III (mórbida)

---

## 📝 7. Checklist para Agentes ao Modificar o Código

Ao realizar qualquer tarefa no projeto:
- [ ] O código respeita a divisão da **Clean Architecture**?
- [ ] Nenhuma dependência proprietária de serverless/Vercel foi introduzida?
- [ ] As variáveis de ambiente continuam funcionando com o arquivo `.env` local?
- [ ] O comando `npm run lint` executa sem nenhum erro de tipagem (`0 errors`)?
- [ ] O arquivo `Dockerfile` e o `docker-compose.yml` permanecem válidos e compatíveis com servidores dedicados?
- [ ] Os testes de regras de negócio em `domain-rules.test.ts` permanecem passando?

---

## ⚡ 8. Configuração OpenCode (`.opencode/`)

O repositório possui suporte nativo à ferramenta **OpenCode** através do diretório `.opencode/`:

### 🎯 Skills Disponíveis (`.opencode/skills/`):
1. **`add-health-metric`**: Guia passo a passo em 9 etapas para adicionar novas métricas clínicas (exemplo prático documentado para Sono/SleepLog).
2. **`clean-architecture-rules`**: Diretrizes de pureza de domínio e regras de importação entre camadas.
3. **`deploy-dedicated-server`**: Instruções e validações para Docker Compose, Nginx e servidor dedicado (regra Sem Vercel).
4. **`clinical-guidelines-validation`**: Tabelas oficiais da SBC, SBD e OMS para parâmetros médicos e validações fisiológicas.
5. **`report-export-engineering`**: Especificações para laudos em PDF e planilhas Excel (CSV UTF-8 BOM).

### ⌨️ Comandos Customizados (`.opencode/commands/`):
- **`/add-metric [nome]`**: Cria o scaffold completo de uma nova métrica no padrão Clean Architecture.
- **`/test-domain`**: Executa `npm run lint` e valida a suíte de testes de regras clínicas.
- **`/deploy-server`**: Valida a prontidão dos arquivos de infraestrutura dedicada.
- **`/check-architecture`**: Audita conformidade com Clean Architecture e ausência de lock-in com Vercel.
- **`/export-report`**: Audita e valida a integridade de exportação de laudos e planilhas.

