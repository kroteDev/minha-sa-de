import React from 'react';
import {
  BloodPressureLog,
  GlucoseLog,
  HeightLog,
  User,
  WeightLog,
} from '../domain/entities';
import { HealthClassificationService } from '../domain/services/HealthClassificationService';
import { ReportExportService } from '../use-cases/ReportExportService';
import { X, Printer, FileSpreadsheet, Download, Heart, Activity, Scale } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  glucose: GlucoseLog[];
  bloodPressure: BloodPressureLog[];
  weight: WeightLog[];
  height: HeightLog[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  user,
  glucose,
  bloodPressure,
  weight,
  height,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    ReportExportService.exportToExcel(user, glucose, bloodPressure, weight, height);
  };

  // Métricas consolidadas
  const latestHeight = height[0]?.heightCm || null;
  const latestWeight = weight[0]?.weightKg || null;
  const bmiResult =
    latestWeight && latestHeight
      ? HealthClassificationService.calculateBMI(latestWeight, latestHeight)
      : null;

  const avgGlucose =
    glucose.length > 0
      ? Math.round(glucose.reduce((acc, curr) => acc + curr.value, 0) / glucose.length)
      : null;

  const avgSys =
    bloodPressure.length > 0
      ? Math.round(bloodPressure.reduce((acc, curr) => acc + curr.systolic, 0) / bloodPressure.length)
      : null;
  const avgDia =
    bloodPressure.length > 0
      ? Math.round(bloodPressure.reduce((acc, curr) => acc + curr.diastolic, 0) / bloodPressure.length)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Barra superior de ações */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div>
            <h2 className="text-lg font-semibold">Relatório Clínico Consolidado de Saúde</h2>
            <p className="text-xs text-slate-400">
              Pronto para emissão em PDF ou exportação para planilhas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition"
              title="Baixar em formato Excel (.csv)"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Imprimível do Relatório */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-6 text-slate-800 bg-white">
          {/* Cabeçalho do Laudo */}
          <div className="border-b-2 border-slate-200 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xl tracking-tight">
                <Activity className="h-6 w-6" />
                <span>HealthTrack — Monitor de Saúde</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Relatório de Acompanhamento Diário e Séries Temporais
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
              <div className="text-slate-400">ID do Paciente: {user.id}</div>
            </div>
          </div>

          {/* Dados do Paciente */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="block text-slate-400 font-medium">Nome do Paciente</span>
              <span className="text-slate-900 font-bold text-sm">{user.name}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Email / Contato</span>
              <span className="text-slate-900 font-medium">{user.email}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Altura Registrada</span>
              <span className="text-slate-900 font-bold text-sm">
                {latestHeight ? `${latestHeight} cm (${(latestHeight / 100).toFixed(2)}m)` : 'Não informada'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium">Peso & IMC Recente</span>
              <span className="text-slate-900 font-bold text-sm">
                {latestWeight ? `${latestWeight} kg` : '-'}
                {bmiResult ? ` (${bmiResult.bmi} kg/m²)` : ''}
              </span>
            </div>
          </div>

          {/* Resumo Executivo / Médias */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Resumo Geral de Indicadores Clínicos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50">
                <div className="flex items-center justify-between text-teal-800 font-semibold mb-1">
                  <span>Glicemia Média</span>
                  <Activity className="h-4 w-4 text-teal-600" />
                </div>
                <div className="text-xl font-bold text-teal-900">
                  {avgGlucose ? `${avgGlucose} mg/dL` : 'Sem dados'}
                </div>
                <div className="text-teal-700 mt-1">Total de {glucose.length} medições registradas</div>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                <div className="flex items-center justify-between text-rose-800 font-semibold mb-1">
                  <span>Pressão Arterial Média</span>
                  <Heart className="h-4 w-4 text-rose-600" />
                </div>
                <div className="text-xl font-bold text-rose-900">
                  {avgSys && avgDia ? `${avgSys}/${avgDia} mmHg` : 'Sem dados'}
                </div>
                <div className="text-rose-700 mt-1">Total de {bloodPressure.length} aferições</div>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center justify-between text-indigo-800 font-semibold mb-1">
                  <span>Status Corporal (IMC)</span>
                  <Scale className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-indigo-900">
                  {bmiResult ? `${bmiResult.bmi} kg/m²` : 'Sem dados'}
                </div>
                <div className="text-indigo-700 mt-1 font-medium">
                  {bmiResult ? bmiResult.category : 'Cadastre peso e altura'}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Glicose */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-teal-600" />
                <span>Histórico de Glicose ({glucose.length} registros)</span>
              </h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Data/Hora</th>
                    <th className="py-2.5 px-3">Valor</th>
                    <th className="py-2.5 px-3">Momento</th>
                    <th className="py-2.5 px-3">Classificação</th>
                    <th className="py-2.5 px-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {glucose.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        Nenhum registro de glicose cadastrado.
                      </td>
                    </tr>
                  ) : (
                    glucose.slice(0, 15).map((g) => {
                      const cls = HealthClassificationService.classifyGlucose(g.value, g.context);
                      const contextName =
                        g.context === 'FASTING'
                          ? 'Jejum'
                          : g.context === 'POST_MEAL'
                          ? 'Pós-refeição'
                          : g.context === 'PRE_MEAL'
                          ? 'Pré-refeição'
                          : g.context === 'BEDTIME'
                          ? 'Antes de dormir'
                          : 'Casual';
                      return (
                        <tr key={g.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(g.measuredAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">{g.value} mg/dL</td>
                          <td className="py-2 px-3 text-slate-600">{contextName}</td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-700">{cls.status}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 italic">{g.notes || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Pressão Arterial */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-600" />
                <span>Histórico de Pressão Arterial ({bloodPressure.length} registros)</span>
              </h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Data/Hora</th>
                    <th className="py-2.5 px-3">Pressão</th>
                    <th className="py-2.5 px-3">Pulso</th>
                    <th className="py-2.5 px-3">Classificação (SBC)</th>
                    <th className="py-2.5 px-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bloodPressure.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        Nenhuma aferição cadastrada.
                      </td>
                    </tr>
                  ) : (
                    bloodPressure.slice(0, 15).map((b) => {
                      let clsCategory = 'Normal';
                      try {
                        clsCategory = HealthClassificationService.classifyBloodPressure(
                          b.systolic,
                          b.diastolic
                        ).category;
                      } catch {}
                      return (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(b.measuredAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {b.systolic} / {b.diastolic} mmHg
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {b.pulse ? `${b.pulse} bpm` : '-'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-700">{clsCategory}</td>
                          <td className="py-2 px-3 text-slate-500 italic">{b.notes || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Peso e Altura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-indigo-600" />
                <span>Registros de Peso</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Peso</th>
                      <th className="py-2 px-3">IMC Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weight.slice(0, 8).map((w) => {
                      let imcText = '-';
                      if (latestHeight) {
                        const c = HealthClassificationService.calculateBMI(w.weightKg, latestHeight);
                        imcText = `${c.bmi} (${c.category})`;
                      }
                      return (
                        <tr key={w.id}>
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(w.measuredAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">{w.weightKg} kg</td>
                          <td className="py-2 px-3 text-slate-600">{imcText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-emerald-600" />
                <span>Histórico de Altura</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Altura</th>
                      <th className="py-2 px-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {height.slice(0, 5).map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 px-3 text-slate-600">
                          {new Date(h.measuredAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {h.heightCm} cm ({(h.heightCm / 100).toFixed(2)}m)
                        </td>
                        <td className="py-2 px-3 text-slate-500 italic">{h.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Rodapé Médico Informativo */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-400 text-center">
            Este documento é um relatório de monitoramento pessoal gerado pelo HealthTrack.
            Não substitui avaliação médica profissional. Consulte seu médico para diagnósticos e condutas clínicas.
          </div>
        </div>
      </div>
    </div>
  );
};
