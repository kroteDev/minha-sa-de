import React, { useState, useEffect, useMemo } from 'react';
import {
  BloodPressureLog,
  GlucoseContext,
  GlucoseLog,
  HeightLog,
  User,
  WeightLog,
} from '../domain/entities';
import { HealthClassificationService } from '../domain/services/HealthClassificationService';
import { HealthMetricUseCases } from '../use-cases/HealthMetricUseCases';
import {
  bpRepo,
  glucoseRepo,
  heightRepo,
  weightRepo,
} from '../repositories/LocalStorageHealthRepository';
import { HealthChart } from './HealthChart';
import { GlucoseModal } from './crud/GlucoseModal';
import { BloodPressureModal } from './crud/BloodPressureModal';
import { WeightModal } from './crud/WeightModal';
import { HeightModal } from './crud/HeightModal';
import { ReportModal } from './ReportModal';
import { TestRunnerModal } from './TestRunnerModal';
import {
  Activity,
  Heart,
  Scale,
  Ruler,
  Plus,
  FileText,
  FileSpreadsheet,
  LogOut,
  Trash2,
  Edit2,
  Filter,
  ShieldCheck,
  TrendingUp,
  Lock,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { ReportExportService } from '../use-cases/ReportExportService';

type ActiveTab = 'dashboard' | 'glucose' | 'bp' | 'weight_height';
type TimeFilter = '7d' | '30d' | '90d' | 'all';

interface DashboardViewProps {
  currentUser: User;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onLogout,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  // Dados das métricas
  const [glucoseLogs, setGlucoseLogs] = useState<GlucoseLog[]>([]);
  const [bpLogs, setBpLogs] = useState<BloodPressureLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [heightLogs, setHeightLogs] = useState<HeightLog[]>([]);
  const [, setLoading] = useState<boolean>(true);

  // Estados dos modais de CRUD
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [editingGlucose, setEditingGlucose] = useState<GlucoseLog | null>(null);

  const [isBpModalOpen, setIsBpModalOpen] = useState(false);
  const [editingBp, setEditingBp] = useState<BloodPressureLog | null>(null);

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightLog | null>(null);

  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const [editingHeight, setEditingHeight] = useState<HeightLog | null>(null);

  // Modais de Relatório e Testes
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // UseCases desacoplados (Clean Architecture)
  const healthUseCases = useMemo(
    () => new HealthMetricUseCases(glucoseRepo, bpRepo, weightRepo, heightRepo),
    []
  );

  // Carrega os dados do usuário atual
  const refreshData = async () => {
    try {
      setLoading(true);
      const [g, b, w, h] = await Promise.all([
        healthUseCases.listGlucose(currentUser.id),
        healthUseCases.listBloodPressure(currentUser.id),
        healthUseCases.listWeight(currentUser.id),
        healthUseCases.listHeight(currentUser.id),
      ]);
      setGlucoseLogs(g);
      setBpLogs(b);
      setWeightLogs(w);
      setHeightLogs(h);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Filtragem temporal para gráficos
  const filterByTime = <T extends { measuredAt: string }>(items: T[]): T[] => {
    if (timeFilter === 'all') return items;
    const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return items.filter((item) => new Date(item.measuredAt) >= cutoff);
  };

  // Cálculos consolidados para o Dashboard
  const latestWeight = weightLogs[0]?.weightKg || null;
  const latestHeight = heightLogs[0]?.heightCm || null;
  const currentBMI =
    latestWeight && latestHeight
      ? HealthClassificationService.calculateBMI(latestWeight, latestHeight)
      : null;

  const latestGlucose = glucoseLogs[0] || null;
  const latestBp = bpLogs[0] || null;

  const recentGlucose = filterByTime(glucoseLogs);
  const recentBp = filterByTime(bpLogs);
  const recentWeight = filterByTime(weightLogs);

  const avgGlucose =
    recentGlucose.length > 0
      ? Math.round(recentGlucose.reduce((acc, c) => acc + c.value, 0) / recentGlucose.length)
      : null;

  const avgSys =
    recentBp.length > 0
      ? Math.round(recentBp.reduce((acc, c) => acc + c.systolic, 0) / recentBp.length)
      : null;
  const avgDia =
    recentBp.length > 0
      ? Math.round(recentBp.reduce((acc, c) => acc + c.diastolic, 0) / recentBp.length)
      : null;

  // Handlers de exclusão
  const handleDeleteGlucose = async (id: string) => {
    if (window.confirm('Deseja excluir este registro de glicose?')) {
      await healthUseCases.deleteGlucose(id);
      refreshData();
    }
  };

  const handleDeleteBp = async (id: string) => {
    if (window.confirm('Deseja excluir este registro de pressão arterial?')) {
      await healthUseCases.deleteBloodPressure(id);
      refreshData();
    }
  };

  const handleDeleteWeight = async (id: string) => {
    if (window.confirm('Deseja excluir este registro de peso?')) {
      await healthUseCases.deleteWeight(id);
      refreshData();
    }
  };

  const handleDeleteHeight = async (id: string) => {
    if (window.confirm('Deseja excluir este registro de altura?')) {
      await healthUseCases.deleteHeight(id);
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Barra de Navegação Superior (Área Segura) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/30 hover:bg-teal-700 transition cursor-pointer"
                title="Ir para a Página Inicial"
              >
                <Activity className="h-6 w-6" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                    HealthTrack
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Lock className="h-2.5 w-2.5" />
                    Área Segura
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Painel de Monitoramento Clínico
                </span>
              </div>
            </div>

            {/* Ações Rápidas do Cabeçalho */}
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateHome}
                className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Página Inicial"
              >
                <Home className="h-3.5 w-3.5 text-slate-500" />
                <span>Início</span>
              </button>

              <button
                onClick={() => setIsTestModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                title="Executar testes unitários de Clean Architecture"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Testes de Domínio</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition cursor-pointer"
                title="Emitir Relatório em PDF"
              >
                <FileText className="h-4 w-4" />
                <span>Relatório PDF</span>
              </button>

              <button
                onClick={() =>
                  ReportExportService.exportToExcel(
                    currentUser,
                    glucoseLogs,
                    bpLogs,
                    weightLogs,
                    heightLogs
                  )
                }
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                title="Baixar planilha para Excel"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2 pl-1">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{currentUser.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Sair da conta e voltar ao início"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação por Abas Principais */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard Diário</span>
            </button>

            <button
              onClick={() => setActiveTab('glucose')}
              className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'glucose'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Glicose ({glucoseLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bp')}
              className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'bp'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Pressão Arterial ({bpLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('weight_height')}
              className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'weight_height'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>Peso, Altura & IMC</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================= ABA 1: DASHBOARD PRINCIPAL ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Boas-vindas e Filtro Temporal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Visão Geral de Saúde
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Métricas diárias consolidadas e tendências recentes de {currentUser.name}
                </p>
              </div>

              {/* Botões de Período */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Período:
                </span>
                {(['7d', '30d', '90d', 'all'] as TimeFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      timeFilter === f
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f === '7d' ? '7 dias' : f === '30d' ? '30 dias' : f === '90d' ? '90 dias' : 'Tudo'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards de Métricas Diárias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Glicose Recente */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Última Glicemia
                  </span>
                  <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                {latestGlucose ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {latestGlucose.value}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">mg/dL</span>
                    </div>
                    {(() => {
                      const cls = HealthClassificationService.classifyGlucose(
                        latestGlucose.value,
                        latestGlucose.context
                      );
                      return (
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${cls.color}`}
                          >
                            {cls.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(latestGlucose.measuredAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-400">Nenhum registro ainda</div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Média no período:</span>
                  <span className="font-bold text-slate-700">
                    {avgGlucose ? `${avgGlucose} mg/dL` : '-'}
                  </span>
                </div>
              </div>

              {/* 2. Pressão Arterial */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-rose-300 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Última Pressão
                  </span>
                  <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
                {latestBp ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {latestBp.systolic}/{latestBp.diastolic}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">mmHg</span>
                    </div>
                    {(() => {
                      let catName = 'Normal';
                      let catColor = 'text-slate-700 bg-slate-100 border-slate-200';
                      try {
                        const c = HealthClassificationService.classifyBloodPressure(
                          latestBp.systolic,
                          latestBp.diastolic
                        );
                        catName = c.category;
                        catColor = c.color;
                      } catch {}
                      return (
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${catColor}`}
                          >
                            {catName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {latestBp.pulse ? `${latestBp.pulse} bpm` : ''}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-400">Nenhum registro ainda</div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Média no período:</span>
                  <span className="font-bold text-slate-700">
                    {avgSys && avgDia ? `${avgSys}/${avgDia} mmHg` : '-'}
                  </span>
                </div>
              </div>

              {/* 3. Peso Corporal */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Peso Atual
                  </span>
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <Scale className="h-4 w-4" />
                  </div>
                </div>
                {latestWeight ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900">{latestWeight}</span>
                      <span className="text-xs text-slate-500 font-medium">kg</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Altura: {latestHeight ? `${latestHeight} cm` : 'Não definida'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(weightLogs[0].measuredAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-400">Nenhum registro de peso</div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Registros de peso:</span>
                  <span className="font-bold text-slate-700">{weightLogs.length} medições</span>
                </div>
              </div>

              {/* 4. Índice de Massa Corporal (IMC) */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Índice de IMC (OMS)
                  </span>
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <Ruler className="h-4 w-4" />
                  </div>
                </div>
                {currentBMI ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {currentBMI.bmi}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">kg/m²</span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentBMI.color}`}
                      >
                        {currentBMI.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-400">
                    Necessita de peso e altura para cálculo
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Faixa ideal OMS:</span>
                  <span className="font-semibold text-emerald-700">18.5 a 24.9</span>
                </div>
              </div>
            </div>

            {/* Ações de Registro Rápido */}
            <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-bold text-slate-600 mr-2 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-teal-600" /> Registro Rápido:
              </span>
              <button
                onClick={() => {
                  setEditingGlucose(null);
                  setIsGlucoseModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition cursor-pointer"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>+ Glicose</span>
              </button>
              <button
                onClick={() => {
                  setEditingBp(null);
                  setIsBpModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5" />
                <span>+ Pressão Arterial</span>
              </button>
              <button
                onClick={() => {
                  setEditingWeight(null);
                  setIsWeightModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
              >
                <Scale className="h-3.5 w-3.5" />
                <span>+ Peso</span>
              </button>
              <button
                onClick={() => {
                  setEditingHeight(null);
                  setIsHeightModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
              >
                <Ruler className="h-3.5 w-3.5" />
                <span>+ Altura</span>
              </button>
            </div>

            {/* Gráficos em Grade Responsiva */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Evolução da Glicemia */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">Histórico de Glicemia</h3>
                  </div>
                  <span className="text-xs text-slate-400">{recentGlucose.length} medições</span>
                </div>
                {(() => {
                  const sorted = [...recentGlucose].sort(
                    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
                  );
                  const labels = sorted.map((g) =>
                    new Date(g.measuredAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  );
                  const data = sorted.map((g) => g.value);
                  return (
                    <HealthChart
                      title="Glicose"
                      labels={labels}
                      yAxisLabel="mg/dL"
                      datasets={[
                        {
                          label: 'Glicemia (mg/dL)',
                          data,
                          borderColor: '#0d9488',
                          backgroundColor: 'rgba(13, 148, 136, 0.1)',
                          fill: true,
                        },
                      ]}
                    />
                  );
                })()}
              </div>

              {/* Gráfico 2: Evolução da Pressão Arterial */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-slate-900">Histórico de Pressão Arterial</h3>
                  </div>
                  <span className="text-xs text-slate-400">{recentBp.length} aferições</span>
                </div>
                {(() => {
                  const sorted = [...recentBp].sort(
                    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
                  );
                  const labels = sorted.map((b) =>
                    new Date(b.measuredAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  );
                  const sysData = sorted.map((b) => b.systolic);
                  const diaData = sorted.map((b) => b.diastolic);
                  return (
                    <HealthChart
                      title="Pressão Arterial"
                      labels={labels}
                      yAxisLabel="mmHg"
                      datasets={[
                        {
                          label: 'Sistólica (Máx)',
                          data: sysData,
                          borderColor: '#e11d48',
                          backgroundColor: 'rgba(225, 29, 72, 0.05)',
                          fill: false,
                        },
                        {
                          label: 'Diastólica (Mín)',
                          data: diaData,
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          fill: false,
                        },
                      ]}
                    />
                  );
                })()}
              </div>

              {/* Gráfico 3: Histórico de Peso & IMC */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Evolução de Peso Corporal (kg)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">{recentWeight.length} registros</span>
                </div>
                {(() => {
                  const sorted = [...recentWeight].sort(
                    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
                  );
                  const labels = sorted.map((w) =>
                    new Date(w.measuredAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  );
                  const data = sorted.map((w) => w.weightKg);
                  return (
                    <HealthChart
                      title="Peso"
                      labels={labels}
                      yAxisLabel="kg"
                      datasets={[
                        {
                          label: 'Peso Corporal (kg)',
                          data,
                          borderColor: '#4f46e5',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          fill: true,
                        },
                      ]}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 2: CRUD DE GLICOSE ================= */}
        {activeTab === 'glucose' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-teal-600" />
                  <span>Monitoramento de Glicose</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Gerenciamento de glicemia em jejum, pós-prandial e casual
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingGlucose(null);
                  setIsGlucoseModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Medição de Glicose</span>
              </button>
            </div>

            {/* Gráfico da aba de Glicose */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Histórico Gráfico de Glicose</h3>
              {(() => {
                const sorted = [...glucoseLogs].sort(
                  (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
                );
                const labels = sorted.map((g) =>
                  new Date(g.measuredAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                );
                const data = sorted.map((g) => g.value);
                return (
                  <HealthChart
                    title="Glicemia"
                    labels={labels}
                    yAxisLabel="mg/dL"
                    datasets={[
                      {
                        label: 'Glicemia (mg/dL)',
                        data,
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        fill: true,
                      },
                    ]}
                  />
                );
              })()}
            </div>

            {/* Tabela do CRUD de Glicose */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Registros Cadastrados ({glucoseLogs.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Data e Hora</th>
                      <th className="py-3 px-4">Glicemia</th>
                      <th className="py-3 px-4">Contexto</th>
                      <th className="py-3 px-4">Classificação (SBD)</th>
                      <th className="py-3 px-4">Observações</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {glucoseLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Nenhum registro encontrado. Clique em "Nova Medição" acima.
                        </td>
                      </tr>
                    ) : (
                      glucoseLogs.map((item) => {
                        const cls = HealthClassificationService.classifyGlucose(
                          item.value,
                          item.context
                        );
                        const contextLabels: Record<GlucoseContext, string> = {
                          FASTING: 'Em Jejum',
                          POST_MEAL: 'Pós-refeição',
                          PRE_MEAL: 'Pré-refeição',
                          BEDTIME: 'Antes de dormir',
                          RANDOM: 'Casual',
                        };
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 text-slate-600">
                              {new Date(item.measuredAt).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-bold text-slate-900">
                                {item.value} mg/dL
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {contextLabels[item.context] || item.context}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${cls.color}`}
                              >
                                {cls.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                              {item.notes || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingGlucose(item);
                                    setIsGlucoseModalOpen(true);
                                  }}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition cursor-pointer"
                                  title="Editar registro"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGlucose(item.id)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                  title="Excluir registro"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 3: CRUD DE PRESSÃO ARTERIAL ================= */}
        {activeTab === 'bp' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-rose-600" />
                  <span>Monitoramento de Pressão Arterial</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Aferições de Pressão Sistólica, Diastólica e Pulso (Diretrizes SBC/AHA)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingBp(null);
                  setIsBpModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Aferição de Pressão</span>
              </button>
            </div>

            {/* Gráfico da aba de Pressão Arterial */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Histórico Gráfico de Pressão Arterial
              </h3>
              {(() => {
                const sorted = [...bpLogs].sort(
                  (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
                );
                const labels = sorted.map((b) =>
                  new Date(b.measuredAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                );
                const sysData = sorted.map((b) => b.systolic);
                const diaData = sorted.map((b) => b.diastolic);
                return (
                  <HealthChart
                    title="Pressão"
                    labels={labels}
                    yAxisLabel="mmHg"
                    datasets={[
                      {
                        label: 'Sistólica (Máxima)',
                        data: sysData,
                        borderColor: '#e11d48',
                        backgroundColor: 'rgba(225, 29, 72, 0.05)',
                        fill: false,
                      },
                      {
                        label: 'Diastólica (Mínima)',
                        data: diaData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        fill: false,
                      },
                    ]}
                  />
                );
              })()}
            </div>

            {/* Tabela do CRUD de Pressão */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Aferições Realizadas ({bpLogs.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Data e Hora</th>
                      <th className="py-3 px-4">Pressão (PAS / PAD)</th>
                      <th className="py-3 px-4">Pulso (bpm)</th>
                      <th className="py-3 px-4">Classificação (SBC)</th>
                      <th className="py-3 px-4">Observações</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bpLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Nenhuma aferição cadastrada. Clique em "Nova Aferição" acima.
                        </td>
                      </tr>
                    ) : (
                      bpLogs.map((item) => {
                        let catName = 'Não classificada';
                        let catColor = 'text-slate-700 bg-slate-100 border-slate-200';
                        try {
                          const c = HealthClassificationService.classifyBloodPressure(
                            item.systolic,
                            item.diastolic
                          );
                          catName = c.category;
                          catColor = c.color;
                        } catch {}
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 text-slate-600">
                              {new Date(item.measuredAt).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-bold text-slate-900">
                                {item.systolic} / {item.diastolic} mmHg
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {item.pulse ? `${item.pulse} bpm` : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${catColor}`}
                              >
                                {catName}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                              {item.notes || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingBp(item);
                                    setIsBpModalOpen(true);
                                  }}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition cursor-pointer"
                                  title="Editar aferição"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBp(item.id)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                  title="Excluir aferição"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 4: CRUD DE PESO E ALTURA ================= */}
        {activeTab === 'weight_height' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Scale className="h-6 w-6 text-indigo-600" />
                  <span>Monitoramento de Peso, Altura e IMC</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Acompanhamento antropométrico e cálculo automático do Índice de Massa Corporal
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setEditingWeight(null);
                    setIsWeightModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Peso</span>
                </button>
                <button
                  onClick={() => {
                    setEditingHeight(null);
                    setIsHeightModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Altura</span>
                </button>
              </div>
            </div>

            {/* Painel do IMC Atual */}
            {currentBMI && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Cálculo de IMC em Tempo Real (OMS)
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {currentBMI.bmi}
                      </span>
                      <span className="text-sm font-bold text-slate-500">kg/m²</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${currentBMI.color}`}
                      >
                        {currentBMI.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{currentBMI.description}</p>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <div>
                      Peso de referência: <strong className="text-slate-800">{latestWeight} kg</strong>
                    </div>
                    <div>
                      Altura de referência:{' '}
                      <strong className="text-slate-800">
                        {latestHeight} cm ({(latestHeight! / 100).toFixed(2)}m)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gráfico de Evolução de Peso */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Histórico Gráfico de Peso Corporal (kg)
              </h3>
              {(() => {
                const sorted = [...weightLogs].sort(
                  (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
                );
                const labels = sorted.map((w) =>
                  new Date(w.measuredAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                );
                const data = sorted.map((w) => w.weightKg);
                return (
                  <HealthChart
                    title="Peso"
                    labels={labels}
                    yAxisLabel="kg"
                    datasets={[
                      {
                        label: 'Peso Corporal (kg)',
                        data,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                      },
                    ]}
                  />
                );
              })()}
            </div>

            {/* Tabelas de Peso e Altura lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CRUD Peso */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-indigo-600" />
                    <span>Pesagens Realizadas ({weightLogs.length})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Peso</th>
                        <th className="py-2.5 px-3">IMC Estimado</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {weightLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            Nenhuma pesagem cadastrada.
                          </td>
                        </tr>
                      ) : (
                        weightLogs.map((item) => {
                          let imcStr = '-';
                          if (latestHeight) {
                            const b = HealthClassificationService.calculateBMI(
                              item.weightKg,
                              latestHeight
                            );
                            imcStr = `${b.bmi} (${b.category})`;
                          }
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 text-slate-600">
                                {new Date(item.measuredAt).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                {item.weightKg} kg
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{imcStr}</td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingWeight(item);
                                      setIsWeightModalOpen(true);
                                    }}
                                    className="p-1 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWeight(item.id)}
                                    className="p-1 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CRUD Altura */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-emerald-600" />
                    <span>Medições de Altura ({heightLogs.length})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Altura</th>
                        <th className="py-2.5 px-3">Metros</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {heightLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            Nenhuma altura cadastrada.
                          </td>
                        </tr>
                      ) : (
                        heightLogs.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 text-slate-600">
                              {new Date(item.measuredAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {item.heightCm} cm
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {(item.heightCm / 100).toFixed(2)} m
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingHeight(item);
                                    setIsHeightModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHeight(item.id)}
                                  className="p-1 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé da Aplicação Segura */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Sessão autenticada como <strong>{currentUser.name}</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Diretrizes: OMS, SBC, SBD</span>
            <span>•</span>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="hover:text-teal-600 transition underline cursor-pointer"
            >
              Executar Testes de Domínio
            </button>
          </div>
        </div>
      </footer>

      {/* ================= MODAIS DE CRUD ================= */}
      <GlucoseModal
        isOpen={isGlucoseModalOpen}
        initialData={editingGlucose}
        onClose={() => setIsGlucoseModalOpen(false)}
        onSave={async (data) => {
          if (editingGlucose) {
            await healthUseCases.updateGlucose(editingGlucose.id, data);
          } else {
            await healthUseCases.addGlucose({
              userId: currentUser.id,
              ...data,
            });
          }
          refreshData();
        }}
      />

      <BloodPressureModal
        isOpen={isBpModalOpen}
        initialData={editingBp}
        onClose={() => setIsBpModalOpen(false)}
        onSave={async (data) => {
          if (editingBp) {
            await healthUseCases.updateBloodPressure(editingBp.id, data);
          } else {
            await healthUseCases.addBloodPressure({
              userId: currentUser.id,
              ...data,
            });
          }
          refreshData();
        }}
      />

      <WeightModal
        isOpen={isWeightModalOpen}
        initialData={editingWeight}
        currentHeightCm={latestHeight}
        onClose={() => setIsWeightModalOpen(false)}
        onSave={async (data) => {
          if (editingWeight) {
            await healthUseCases.updateWeight(editingWeight.id, data);
          } else {
            await healthUseCases.addWeight({
              userId: currentUser.id,
              ...data,
            });
          }
          refreshData();
        }}
      />

      <HeightModal
        isOpen={isHeightModalOpen}
        initialData={editingHeight}
        onClose={() => setIsHeightModalOpen(false)}
        onSave={async (data) => {
          if (editingHeight) {
            await healthUseCases.updateHeight(editingHeight.id, data);
          } else {
            await healthUseCases.addHeight({
              userId: currentUser.id,
              ...data,
            });
          }
          refreshData();
        }}
      />

      {/* ================= MODAL DE RELATÓRIO ================= */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        user={currentUser}
        glucose={glucoseLogs}
        bloodPressure={bpLogs}
        weight={weightLogs}
        height={heightLogs}
      />

      {/* ================= MODAL DE TESTES DE DOMÍNIO ================= */}
      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};
