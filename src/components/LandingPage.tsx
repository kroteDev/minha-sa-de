import React from 'react';
import {
  Activity,
  Heart,
  Scale,
  Ruler,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Lock,
  Server,
  Database,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  BarChart3,
  UserCheck,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onQuickDemoLogin: () => void;
  isAuthenticated?: boolean;
  onGoToDashboard?: () => void;
  userName?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onGoToRegister,
  onQuickDemoLogin,
  isAuthenticated,
  onGoToDashboard,
  userName,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold">
              <Activity className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block leading-tight">
                HealthTrack
              </span>
              <span className="text-[10px] font-semibold text-teal-400 tracking-wider uppercase block">
                Monitor de Saúde Diário
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#recursos" className="hover:text-teal-400 transition">
              Métricas & Recursos
            </a>
            <a href="#diretrizes" className="hover:text-teal-400 transition">
              Padrões Clínicos
            </a>
            <a href="#seguranca" className="hover:text-teal-400 transition">
              Segurança & Infra
            </a>
            <a href="#laudos" className="hover:text-teal-400 transition">
              Laudos Médicos
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition shadow-sm cursor-pointer"
              >
                <span>Acessar Meu Painel ({userName || 'Usuário'})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onGoToLogin}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={onGoToRegister}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition shadow-sm shadow-teal-500/20 cursor-pointer"
                >
                  <span>Criar Conta</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-900">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3.5 py-1.5 text-xs font-semibold text-teal-300 backdrop-blur-sm mb-6 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>Diretrizes Oficiais: SBC • SBD • Organização Mundial da Saúde</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Monitore sua saúde diária com{' '}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                precisão clínica
              </span>{' '}
              e controle total.
            </h1>

            {/* Hero Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              O <strong>HealthTrack</strong> é uma plataforma robusta para acompanhamento de{' '}
              <span className="text-teal-300 font-medium">Glicemia</span>,{' '}
              <span className="text-rose-300 font-medium">Pressão Arterial</span>,{' '}
              <span className="text-indigo-300 font-medium">Peso e IMC</span>. Gráficos históricos
              intuitivos, validações fisiológicas imediatas e emissão de laudos médicos completos em
              PDF e planilhas Excel.
            </p>

            {/* Call to Actions (CTAs) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-teal-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 hover:bg-teal-400 hover:shadow-teal-500/40 active:scale-[0.99] transition cursor-pointer"
              >
                <span>Acessar Login / Painel</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onQuickDemoLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-teal-400" />
                <span>Testar com Conta Demo (1-Clique)</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                Rota 100% Protegida por Autenticação
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                Sem Vercel • Servidor Dedicado / Docker
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                Clean Architecture & Testes de Domínio
              </span>
            </div>
          </div>

          {/* Hero Banner Visual Showcase (Interactive Preview Mockup) */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-slate-400 font-mono text-[11px] ml-2">
                  app.healthtrack.internal / dashboard
                </span>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <Lock className="h-3 w-3" />
                Ambiente Autenticado
              </span>
            </div>

            {/* Showcase Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {/* Card 1: Glicose */}
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 relative overflow-hidden group hover:border-teal-500/40 transition">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Glicemia em Jejum</span>
                  <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">92</span>
                  <span className="text-xs text-slate-400 font-medium">mg/dL</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                    Normal (SBD)
                  </span>
                  <span className="text-[10px] text-slate-500">Hoje, 07:30</span>
                </div>
              </div>

              {/* Card 2: Pressão Arterial */}
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 relative overflow-hidden group hover:border-rose-500/40 transition">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Pressão Arterial</span>
                  <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-400">
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">118/76</span>
                  <span className="text-xs text-slate-400 font-medium">mmHg</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Ótima (SBC)
                  </span>
                  <span className="text-[10px] text-slate-500">68 bpm</span>
                </div>
              </div>

              {/* Card 3: Peso */}
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 relative overflow-hidden group hover:border-indigo-500/40 transition">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Peso Corporal</span>
                  <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
                    <Scale className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">72.4</span>
                  <span className="text-xs text-slate-400 font-medium">kg</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Altura: 178 cm</span>
                  <span className="text-[10px] text-slate-500">-1.2 kg no mês</span>
                </div>
              </div>

              {/* Card 4: IMC */}
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 relative overflow-hidden group hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Índice de IMC</span>
                  <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                    <Ruler className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">22.8</span>
                  <span className="text-xs text-slate-400 font-medium">kg/m²</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                    Peso Normal (OMS)
                  </span>
                  <span className="text-[10px] text-slate-500">Faixa 18.5-24.9</span>
                </div>
              </div>
            </div>

            {/* Preview Banner Footer CTA bar */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <BarChart3 className="h-4 w-4 text-teal-400" />
                <span>
                  Visualização gráfica interativa com Chart.js, filtros de 7, 30, 90 dias e todo o
                  histórico.
                </span>
              </div>
              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition cursor-pointer"
              >
                <span>Acessar Painel Completo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 1: Principais Recursos do HealthTrack */}
      <section id="recursos" className="py-20 border-b border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-teal-400 uppercase">
              Tudo o que você precisa
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              O que o HealthTrack faz por você?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Projetado para quem precisa de rigor no controle diário de dados vitais e relatórios
              claros para consultas médicas.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-7 hover:border-teal-500/50 hover:bg-slate-900/80 transition group">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Controle Glicêmico Avançado</h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Registre glicemia em jejum, pós-prandial, pré-refeição e casual. Receba
                classificações automáticas segundo a SBD (Sociedade Brasileira de Diabetes) e ADA,
                incluindo alertas para hipoglicemia.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-teal-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Metas diferenciadas por contexto alimentar
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-7 hover:border-rose-500/50 hover:bg-slate-900/80 transition group">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Pressão Arterial & Pulso</h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Acompanhe pressão sistólica e diastólica categorizadas nas 6 faixas da Sociedade
                Brasileira de Cardiologia (SBC): Ótima, Normal, Pré-hipertensão, Estágio 1, Estágio
                2 e Crise Hipertensiva.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-rose-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Validação fisiológica física (PAS &gt; PAD)
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-7 hover:border-indigo-500/50 hover:bg-slate-900/80 transition group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Antropometria & Cálculo de IMC</h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Cálculo em tempo real do Índice de Massa Corporal (IMC) baseado nos padrões da
                Organização Mundial da Saúde (OMS), do estado eutrófico à obesidade mórbida, com
                acompanhamento da evolução temporal.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-indigo-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Histórico de pesagens e medições de altura
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Laudos Médicos e Exportações */}
      <section id="laudos" className="py-20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-wider text-teal-400 uppercase">
                Pronto para a consulta médica
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                Emita Laudos em PDF e Planilhas para o seu Médico
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Não chegue mais ao consultório com anotações soltas ou cadernetas difíceis de
                analisar. Com um único clique, o HealthTrack gera relatórios médicos completos
                formatados para impressão ou envio digital.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-teal-500/10 p-2 text-teal-400 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Laudo Médico em PDF</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Consolida médias de glicemia, pressão sistólica/diastólica, IMC, distribuição
                      de medições e histórico detalhado formatado com padrão clínico profissional.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 mt-0.5">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Planilha Excel (CSV UTF-8 BOM)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Exportação instantânea compatível com Microsoft Excel em português, contendo
                      todas as colunas e formatos numéricos adequados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 mt-0.5">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gráficos de Tendência</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Curvas visuais com Chart.js permitindo identificar picos pressóricos ou
                      glicêmicos em períodos específicos do dia ou da semana.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onGoToLogin}
                  className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-teal-400 transition cursor-pointer"
                >
                  <span>Acessar e Gerar Meu Laudo</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document preview card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md relative shadow-xl">
              <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block">
                      HealthTrack — Laudo de Saúde
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Relatório Clínico Integrado
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <span>Emissão Digital</span>
                    <span className="block font-semibold text-slate-700">Padrão SBD/SBC</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Pressão Arterial Média</span>
                    <strong className="text-sm text-slate-900">118 / 76 mmHg</strong>
                    <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Classificação: Ótima
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Glicemia Média</span>
                    <strong className="text-sm text-slate-900">95 mg/dL</strong>
                    <span className="block text-[10px] text-teal-700 font-semibold mt-0.5">
                      Classificação: Normal
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Antropometria: IMC 22.8 kg/m²</span>
                  <span className="font-semibold text-slate-700">Autenticação Segura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 3: Diretrizes Médicas e Segurança de Infra */}
      <section id="diretrizes" className="py-20 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-teal-400 uppercase">
              Rigor Clínico e Arquitetura
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Construído para Confiança e Privacidade
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Cada cálculo e classificação segue documentação médica rigorosa, e todo o sistema foi
              arquitetado sem dependências de provedores serverless proprietários.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400 w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">Clean Architecture</h4>
              <p className="mt-1 text-xs text-slate-400">
                Camadas desacopladas: Domínio puro sem frameworks, UseCases testáveis e
                Repositories independentes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 w-fit">
                <Server className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">Sem Vercel / Lock-in</h4>
              <p className="mt-1 text-xs text-slate-400">
                Hospedagem local imediata e implantação em servidor dedicado (VPS Linux) com Docker
                Compose e Nginx nativo.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 w-fit">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">PostgreSQL & Prisma</h4>
              <p className="mt-1 text-xs text-slate-400">
                Persistência relacional de alta confiabilidade para ambientes de produção dedicados
                com schemas tipados.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400 w-fit">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-white">Rotas 100% Protegidas</h4>
              <p className="mt-1 text-xs text-slate-400">
                Nenhuma informação médica é exposta publicamente. O dashboard e todas as métricas só
                são visíveis após login autenticado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4: Banner Final de Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-teal-950/20 to-slate-950 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/80 px-4 py-1.5 text-xs font-semibold text-teal-300 mb-6">
            <Activity className="h-3.5 w-3.5 text-teal-400" />
            <span>Comece a monitorar sua saúde hoje</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pronto para assumir o controle da sua saúde diária?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Acesse a página de login agora mesmo para entrar na sua conta ou experimente o modo de
            demonstração com dados clínicos pré-carregados.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-teal-500 px-8 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-teal-500/25 hover:bg-teal-400 transition cursor-pointer"
            >
              <span>Ir para a Página de Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onQuickDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-teal-400" />
              <span>Entrar com Conta de Demonstração</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-400">HealthTrack</span>
            <span>— Monitor de Saúde Diário</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Diretrizes: SBD • SBC • OMS</span>
            <span>•</span>
            <button
              onClick={onGoToLogin}
              className="hover:text-teal-400 transition underline cursor-pointer"
            >
              Página de Login
            </button>
            <span>•</span>
            <button
              onClick={onQuickDemoLogin}
              className="hover:text-teal-400 transition underline cursor-pointer"
            >
              Acesso Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
