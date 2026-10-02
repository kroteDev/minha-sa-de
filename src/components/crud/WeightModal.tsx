import React, { useState, useEffect } from 'react';
import { WeightLog } from '../../domain/entities';
import { HealthClassificationService } from '../../domain/services/HealthClassificationService';
import { X, Scale, AlertCircle } from 'lucide-react';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { weightKg: number; notes?: string; measuredAt: string }) => Promise<void>;
  initialData?: WeightLog | null;
  currentHeightCm?: number | null;
}

export const WeightModal: React.FC<WeightModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentHeightCm,
}) => {
  const [weightKg, setWeightKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [measuredAt, setMeasuredAt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setWeightKg(initialData.weightKg.toString());
      setNotes(initialData.notes || '');
      const date = new Date(initialData.measuredAt);
      const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMeasuredAt(localIso);
    } else {
      setWeightKg('');
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

  const numWeight = parseFloat(weightKg);
  let liveBMI = null;
  if (!isNaN(numWeight) && numWeight > 0 && currentHeightCm && currentHeightCm > 0) {
    try {
      liveBMI = HealthClassificationService.calculateBMI(numWeight, currentHeightCm);
    } catch {
      liveBMI = null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(weightKg);
    if (isNaN(val) || val <= 0) {
      setError('Por favor, informe um peso válido.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        weightKg: val,
        notes: notes.trim() || undefined,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar registro de peso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialData ? 'Editar Peso Corporal' : 'Nova Pesagem'}
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
              Peso (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Ex: 75.4"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 text-base font-medium"
            />
          </div>

          {liveBMI && (
            <div className={`rounded-xl p-3 border text-xs ${liveBMI.color}`}>
              <div className="flex items-center justify-between font-semibold">
                <span>IMC Calculado: {liveBMI.bmi} kg/m²</span>
                <span>{liveBMI.category}</span>
              </div>
              <p className="mt-0.5 opacity-90">{liveBMI.description}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Data e Horário da Pesagem
            </label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: em jejum pela manhã, após treino"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 text-sm"
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
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Adicionar Pesagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
