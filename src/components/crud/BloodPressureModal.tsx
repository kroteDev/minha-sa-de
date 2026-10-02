import React, { useState, useEffect } from 'react';
import { BloodPressureLog } from '../../domain/entities';
import { HealthClassificationService } from '../../domain/services/HealthClassificationService';
import { X, Heart, AlertCircle } from 'lucide-react';

interface BloodPressureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    systolic: number;
    diastolic: number;
    pulse?: number;
    notes?: string;
    measuredAt: string;
  }) => Promise<void>;
  initialData?: BloodPressureLog | null;
}

export const BloodPressureModal: React.FC<BloodPressureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [measuredAt, setMeasuredAt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSystolic(initialData.systolic.toString());
      setDiastolic(initialData.diastolic.toString());
      setPulse(initialData.pulse ? initialData.pulse.toString() : '');
      setNotes(initialData.notes || '');
      const date = new Date(initialData.measuredAt);
      const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMeasuredAt(localIso);
    } else {
      setSystolic('');
      setDiastolic('');
      setPulse('');
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

  // Validação e classificação em tempo real
  const numSys = parseInt(systolic, 10);
  const numDia = parseInt(diastolic, 10);
  let liveClassification = null;
  if (!isNaN(numSys) && !isNaN(numDia) && numSys > numDia) {
    try {
      liveClassification = HealthClassificationService.classifyBloodPressure(numSys, numDia);
    } catch {
      liveClassification = null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);
    const pul = pulse ? parseInt(pulse, 10) : undefined;

    if (isNaN(sys) || isNaN(dia)) {
      setError('Por favor, informe a pressão sistólica e diastólica.');
      return;
    }

    if (sys <= dia) {
      setError('A pressão sistólica (máxima) deve ser estritamente maior que a diastólica (mínima).');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        systolic: sys,
        diastolic: dia,
        pulse: pul,
        notes: notes.trim() || undefined,
        measuredAt: measuredAt ? new Date(measuredAt).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar medição de pressão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialData ? 'Editar Pressão Arterial' : 'Nova Aferição de Pressão'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sistólica (Máx. mmHg) *
              </label>
              <input
                type="number"
                step="1"
                required
                placeholder="Ex: 120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600 text-base font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Diastólica (Mín. mmHg) *
              </label>
              <input
                type="number"
                step="1"
                required
                placeholder="Ex: 80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600 text-base font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Frequência Cardíaca / Pulso (bpm)
            </label>
            <input
              type="number"
              step="1"
              placeholder="Ex: 72"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600 text-sm"
            />
          </div>

          {liveClassification && (
            <div className={`rounded-xl p-3 border text-xs ${liveClassification.color}`}>
              <div className="font-semibold">{liveClassification.category}</div>
              <p className="mt-0.5 opacity-90">{liveClassification.advice}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Data e Horário da Aferição
            </label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: braço esquerdo, sentado em repouso por 5 min"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600 text-sm"
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
              className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Adicionar Aferição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
