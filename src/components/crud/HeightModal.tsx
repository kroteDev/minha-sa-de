import React, { useState, useEffect } from 'react';
import { HeightLog } from '../../domain/entities';
import { X, Ruler, AlertCircle } from 'lucide-react';

interface HeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { heightCm: number; notes?: string; measuredAt: string }) => Promise<void>;
  initialData?: HeightLog | null;
}

export const HeightModal: React.FC<HeightModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [heightCm, setHeightCm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [measuredAt, setMeasuredAt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setHeightCm(initialData.heightCm.toString());
      setNotes(initialData.notes || '');
      const date = new Date(initialData.measuredAt);
      const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMeasuredAt(localIso);
    } else {
      setHeightCm('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(heightCm);
    if (isNaN(val) || val < 40 || val > 280) {
      setError('Por favor, informe uma altura válida entre 40 cm e 280 cm.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        heightCm: val,
        notes: notes.trim() || undefined,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar medição de altura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Ruler className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialData ? 'Editar Registro de Altura' : 'Nova Medição de Altura'}
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
              Altura (cm) *
            </label>
            <input
              type="number"
              step="0.5"
              required
              placeholder="Ex: 175 ou 180"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-base font-medium"
            />
            {parseFloat(heightCm) > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Equivalente a {(parseFloat(heightCm) / 100).toFixed(2)} metros
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Data da Medição
            </label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: aferição no consultório médico com estadiômetro"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm"
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
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Salvar Altura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
