import React, { useState } from 'react';
import { AuthUseCases } from '../use-cases/AuthUseCases';
import { userRepo } from '../repositories/LocalStorageHealthRepository';
import {
  Activity,
  Heart,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { User } from '../domain/entities';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigateHome?: () => void;
  initialMode?: 'login' | 'register';
  redirectReason?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateHome,
  initialMode = 'login',
  redirectReason,
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('usuario@saude.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authUseCases = new AuthUseCases(userRepo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const user = await authUseCases.register({
          name,
          email,
          password,
        });
        onLoginSuccess(user);
      } else {
        const user = await authUseCases.login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await authUseCases.login('usuario@saude.com', '123456');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || 'Erro ao entrar na conta demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 font-sans antialiased">
      {/* Botão de Retorno ao Início */}
      {onNavigateHome && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para a Página Inicial</span>
          </button>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <Activity className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          HealthTrack
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Acesso à Área Segura de Monitoramento Clínico
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Aviso de Rota Protegida se houver */}
        {redirectReason && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-800 border border-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <span>{redirectReason}</span>
          </div>
        )}

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {/* Alternador Entrar / Cadastrar */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                !isRegister
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                isRegister
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition cursor-pointer"
            >
              <span>
                {loading
                  ? 'Processando...'
                  : isRegister
                  ? 'Cadastrar e Acessar Área Segura'
                  : 'Entrar no Monitor'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Atalho Demo */}
          {!isRegister && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 text-teal-600 fill-teal-600" />
                <span>Entrar direto com dados de demonstração (Carlos Silva)</span>
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                14 dias de registros prévios de glicose, pressão, peso e altura para testes
                imediatos.
              </p>
            </div>
          )}
        </div>

        {/* Pilares da Arquitetura */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
          <div className="rounded-lg bg-white/70 p-2 border border-slate-200/50">
            <span className="font-semibold text-slate-700 block">Clean Arch</span>
            Domínio & UseCases
          </div>
          <div className="rounded-lg bg-white/70 p-2 border border-slate-200/50">
            <span className="font-semibold text-slate-700 block">Prisma ORM</span>
            PostgreSQL Dedicado
          </div>
          <div className="rounded-lg bg-white/70 p-2 border border-slate-200/50">
            <span className="font-semibold text-slate-700 block">Docker</span>
            Nginx & Compose
          </div>
        </div>
      </div>
    </div>
  );
};
