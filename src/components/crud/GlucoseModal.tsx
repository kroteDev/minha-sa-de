import React, { useState, useEffect } from 'react';
import { GlucoseContext, GlucoseLog } from '../../domain/entities';
import { HealthClassificationService } from '../../domain/services/HealthClassificationService';
import { X, Activity, AlertCircle } from 'lucide-react';

interface GlucoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { value: number; context: GlucoseContext; notes?: string; measuredAt: string }) => Promise<void>;
  initialData?: GlucoseLog | null;
}

export const GlucoseModal: React.FC<GlucoseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [value, setValue] = useState<string>('');
  const [context, setContext] = useState<GlucoseContext>('FASTING');
  const [notes, setNotes] = useState<string>('');
  const [measuredAt, setMeasuredAt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValue(initialData.value.toString());
      setContext(initialData.context);
      setNotes(initialData.notes || '');
      // Formata para datetime-local
      const date = new Date(initialData.measuredAt);
      const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMeasuredAt(localIso);
    } else {
      setValue('');
      setContext('FASTING');
      setNotes('');
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMeasuredAt(localIso);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Classificação em tempo real
  const numValue = parseFloat(value);
  let liveClassification = null;
  if (!isNaN(numValue) && numValue > 0) {
    try {
      liveClassification = HealthClassificationService.classifyGlucose(numValue, context);
    } catch {
      liveClassification = null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericVal = parseFloat(value);
    if (isNaN(numericVal) || numericVal <= 0) {
      setError('Por favor, informe um valor de glicose válido.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        value: numericVal,
        context,
        notes: notes.trim() || undefined,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar medição de glicose.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialData ? 'Editar Medição de Glicose' : 'Novo Registro de Glicose'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Glicemia (mg/dL) *
            </label>
            <input
              type="number"
              step="1"
              required
              placeholder="Ex: 95"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 text-base font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Momento da Medição *
            </label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value as GlucoseContext)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 text-sm"
            >
              <option value="FASTING">Em Jejum (matinal/8h+)</option>
              <option value="PRE_MEAL">Pré-refeição</option>
              <option value="POST_MEAL">Pós-refeição (1h a 2h após)</option>
              <option value="BEDTIME">Antes de dormir</option>
              <option value="RANDOM">Casual / Aleatório</option>
            </select>
          </div>

          {liveClassification && (
            <div className={`rounded-xl p-3 border text-xs ${liveClassification.color}`}>
              <div className="font-semibold">{liveClassification.status}</div>
              <p className="mt-0.5 opacity-90">{liveClassification.advice}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Data e Horário da Medição
            </label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: após exercício físico, café da manhã reforçado"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Adicionar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
