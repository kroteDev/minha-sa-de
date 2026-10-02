import React, { useState, useEffect } from 'react';
import { runBusinessRulesTests, TestResult } from '../tests/domain-rules.test';
import { X, CheckCircle2, XCircle, Play, ShieldCheck, Clock } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [suiteResult, setSuiteResult] = useState<{
    results: TestResult[];
    total: number;
    passed: number;
    failed: number;
    durationTotal: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runBusinessRulesTests();
      setSuiteResult(res);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen && !suiteResult) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Suíte de Testes Unitários de Domínio</h2>
              <p className="text-xs text-slate-400">
                Validação formal das regras de negócio (Clean Architecture)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={executeTests}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRunning ? 'Executando...' : 'Reexecutar Testes'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Resumo */}
        {suiteResult && (
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {suiteResult.passed} aprovados
              </span>
              {suiteResult.failed > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-rose-700">
                  <XCircle className="h-4 w-4" />
                  {suiteResult.failed} com falha
                </span>
              )}
              <span className="text-slate-500 font-medium">Total: {suiteResult.total} testes</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
              <Clock className="h-3.5 w-3.5" />
              <span>{suiteResult.durationTotal} ms</span>
            </div>
          </div>
        )}

        {/* Lista de Testes */}
        <div className="p-6 overflow-y-auto divide-y divide-slate-100">
          {!suiteResult && isRunning ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Executando suíte de testes de regras de negócio...
            </div>
          ) : (
            suiteResult?.results.map((r, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  {r.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 mr-2 uppercase tracking-wider">
                      {r.category}
                    </span>
                    <span className="font-medium text-slate-800">{r.name}</span>
                    {r.error && (
                      <p className="mt-1 font-mono text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        {r.error}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">{r.durationMs}ms</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
