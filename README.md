# 🩺 HealthTrack — Monitor de Saúde Diário

Aplicativo completo para monitoramento diário de indicadores vitais de saúde (Glicose, Pressão Arterial, Peso, Altura e IMC), desenvolvido com **Next.js**, **Prisma ORM**, **PostgreSQL** e **Docker**, seguindo os princípios de **Clean Architecture** e alimentado por gráficos de alta performance com **Chart.js** e estilização com **Tailwind CSS**.

---

## 🏛️ Arquitetura do Sistema (Clean Architecture)

O projeto foi estruturado com clara separação de responsabilidades em camadas desacopladas e testáveis:

```
src/
├── domain/                      # 1. Camada de Domínio (Regras de negócio puras)
│   ├── entities.ts              # Entidades: User, GlucoseLog, BloodPressureLog, WeightLog, HeightLog
│   ├── services/
│   │   └── HealthClassificationService.ts # Cálculo de IMC (OMS), classificação de PA (SBC/AHA) e glicose (SBD/ADA)
│   └── repositories/
│       └── interfaces.ts        # Interfaces abstratas de persistência (Portas)
│
├── use-cases/                   # 2. Camada de Casos de Uso (Fluxos de aplicação)
│   ├── AuthUseCases.ts          # Registro e login com hash seguro
│   ├── HealthMetricUseCases.ts  # CRUD de métricas, filtros temporais e agregação de médias
│   └── ReportExportService.ts   # Emissão de laudo médico PDF e exportação Excel (.csv com UTF-8 BOM)
│
├── repositories/                # 3. Camada de Repositórios & Infraestrutura (Adaptadores)
│   ├── LocalStorageHealthRepository.ts # Adaptador offline-first persistente para cliente e demo
│   └── PrismaHealthRepository.ts       # Adaptador Prisma Client para banco PostgreSQL em produção
│
├── components/                  # 4. Interface com o Usuário (Apresentação)
│   ├── HealthChart.tsx          # Renderizador de gráficos interativos com Chart.js nativo
│   ├── LoginView.tsx            # Tela de autenticação e acesso rápido à conta de demonstração
│   ├── ReportModal.tsx          # Laudo médico consolidado imprimível em PDF e exportação Excel
│   ├── TestRunnerModal.tsx      # Painel de execução visual da suíte de testes unitários
│   └── crud/                    # Modais de inserção e edição de dados com validação em tempo real
│       ├── GlucoseModal.tsx
│       ├── BloodPressureModal.tsx
│       ├── WeightModal.tsx
│       └── HeightModal.tsx
│
└── tests/                       # 5. Suíte de Testes Unitários de Regras de Negócio
    └── domain-rules.test.ts     # Testes cobrindo IMC, pressão, glicemia, limites fisiológicos e erros
```

---

## 📊 Indicadores Monitorados & Regras Clínicas

1. **Glicemia (Glicose)**:
   - Medição em mg/dL com especificação do momento (Em Jejum, Pré-refeição, Pós-refeição, Antes de dormir, Casual).
   - Classificação segundo diretrizes da **SBD** e **ADA** (Hipoglicemia, Normal, Pré-diabetes/Elevada, Diabetes provável).

2. **Pressão Arterial**:
   - Aferição da Pressão Sistólica (PAS), Diastólica (PAD) e Frequência Cardíaca (bpm).
   - Classificação segundo a **Sociedade Brasileira de Cardiologia (SBC)** e **AHA** (Ótima, Normal, Pré-hipertensão, Hipertensão Estágio 1, Hipertensão Estágio 2, Crise Hipertensiva).

3. **Peso Corporal & IMC**:
   - Registro de peso em kg com cálculo dinâmico e em tempo real do **Índice de Massa Corporal (IMC)** baseado na altura atual registrada.
   - Categorização pela **OMS** (Abaixo do peso, Peso normal, Sobrepeso, Obesidade Graus I, II e III).

4. **Altura**:
   - Registro em centímetros com conversão automática para metros.

5. **Gráficos e Relatórios**:
   - Gráficos de linhas de alta velocidade com `Chart.js`, filtráveis por períodos de 7 dias, 30 dias, 90 dias ou histórico completo.
   - Exportação para **Excel** (`.csv` formatado para Microsoft Excel com ponto-e-vírgula e UTF-8 BOM).
   - Emissão de **Laudo / Relatório em PDF** formatado para impressão ou arquivamento.

---

---

## 🚫 Diretriz de Hospedagem: Servidor Dedicado (Não Vercel)

> **Importante:** Este projeto é projetado especificamente para **hospedagem local durante o desenvolvimento/testes** e posterior implantação em **Servidor Dedicado (VPS ou Bare Metal Linux)**.
> Não possui dependências de plataformas proprietárias serverless como a Vercel. Todas as variáveis de ambiente residem localmente nos arquivos `.env` ou nas configurações do container/sistema operacional.

Consulte o arquivo [`AGENTS.md`](./AGENTS.md) ou [`Agents.md`](./Agents.md) para as diretrizes completas de desenvolvimento, arquitetura e convenções para agentes de IA e engenheiros.

---

## 💻 1. Execução no Ambiente Local (Testes e Verificação)

Para testar o aplicativo e verificar o código em sua máquina local:

### 1.1 Requisitos:
- Node.js (conforme definido no `.nvmrc` — `v22.12.0` ou superior)
- Git

Use o NVM para carregar a versão correta do Node:
```bash
nvm use
```

### 1.2 Instalar as dependências:
```bash
npm install
```

### 1.3 Configurar variáveis de ambiente locais:
Copie o arquivo `.env.local` para `.env`:
```bash
cp .env.local .env
```

### 1.4 Testar e verificar o código:
```bash
# Validação de tipagem e integridade do TypeScript
npm run lint

# Iniciar o servidor local de desenvolvimento
npm run dev
```

Acesse em seu navegador: **[http://localhost:3000](http://localhost:3000)**.
O modo local já possui uma conta de demonstração com histórico completo de 14 dias:
- **Email:** `usuario@saude.com`
- **Senha:** `123456`

---

## 🐳 2. Testando com Docker Localmente

Para simular o ambiente de produção completo na sua máquina local com banco PostgreSQL:

```bash
# Subir containers (PostgreSQL 16 + HealthTrack Web)
docker compose up -d --build

# Verificar logs
docker compose logs -f

# Parar os containers
docker compose down
```

---

## 🖥️ 3. Implantação em Servidor Dedicado (Produção)

Para hospedar o **HealthTrack** em um servidor dedicado (ex.: Ubuntu Server 22.04/24.04 LTS ou Debian 12):

### 3.1 Preparação do Servidor Dedicado:
```bash
# Atualizar repositórios e instalar Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker
```

### 3.2 Clonar o Projeto e Configurar Variáveis Locais de Produção:
```bash
git clone <seu-repositorio> /opt/healthtrack
cd /opt/healthtrack

# Copiar modelo de produção
cp .env.production.example .env

# Configurar senhas e domínio no arquivo local
nano .env
```

### 3.3 Executar Deploy Automatizado:
```bash
chmod +x deploy-dedicated-server.sh
./deploy-dedicated-server.sh
```

### 3.4 Configurar Nginx Reverso e SSL Grátis (Let's Encrypt):
Copie o arquivo de configuração pré-pronto:
```bash
sudo cp nginx-dedicated-server.conf /etc/nginx/sites-available/healthtrack.conf
sudo ln -s /etc/nginx/sites-available/healthtrack.conf /etc/nginx/sites-enabled/

# Ajuste seu domínio no arquivo /etc/nginx/sites-available/healthtrack.conf
sudo nano /etc/nginx/sites-available/healthtrack.conf

# Emitir certificado SSL
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
sudo nginx -t && sudo systemctl reload nginx
```

### 3.5 Backup Automático Diário do PostgreSQL no Servidor:
Adicione ao `crontab -e`:
```bash
0 3 * * * docker exec healthtrack_postgres pg_dump -U health_prod_user healthtrack_production | gzip > /var/backups/healthtrack_$(date +\%F).sql.gz
```

---

## 🧪 Testes Unitários de Regras de Negócio

A aplicação conta com testes unitários cobrindo as regras de negócio médicas:
- **Cálculo de IMC**: Todas as categorias da OMS e validação de dados extremos.
- **Pressão Arterial**: Classificação completa SBC/AHA e bloqueio de inconsistências físicas (PAS ≤ PAD).
- **Glicemia**: Classificação em jejum e pós-prandial segundo SBD/ADA, com alerta imediato de hipoglicemia (< 70 mg/dL).

Você pode executar os testes a qualquer momento clicando no botão **"Testes de Domínio"** no cabeçalho da aplicação web.

---

## 👤 Credenciais da Demonstração

- **Email:** `usuario@saude.com`
- **Senha:** `123456`
- Totalmente funcional offline e local com dados pré-carregados para avaliação imediata.

