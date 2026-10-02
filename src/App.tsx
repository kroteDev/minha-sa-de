import React, { useState, useEffect } from 'react';
import { User } from './domain/entities';
import { userRepo } from './repositories/LocalStorageHealthRepository';
import { LandingPage } from './components/LandingPage';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';

type AppRoute = 'landing' | 'login' | 'dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('landing');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [authRedirectReason, setAuthRedirectReason] = useState<string | null>(null);

  // Carrega usuário salvo se houver sessão ativa
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('healthtrack_active_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Erro ao ler usuário salvo:', e);
    }
  }, []);

  // Sincronização com o Hash da URL para navegação compatível com qualquer servidor (Vite, Nginx, Docker)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'dashboard') {
        const savedUser = localStorage.getItem('healthtrack_active_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setCurrentUser(parsed);
            setCurrentRoute('dashboard');
            setAuthRedirectReason(null);
          } catch {
            setCurrentRoute('login');
            setAuthRedirectReason('Sessão expirada. Por favor, autentique-se novamente.');
          }
        } else {
          setCurrentRoute('login');
          setAuthRedirectReason('Acesso restrito: faça login para acessar a área segura de monitoramento.');
          window.location.hash = 'login';
        }
      } else if (hash === 'login' || hash === 'entrar') {
        setLoginMode('login');
        setCurrentRoute('login');
      } else if (hash === 'cadastrar' || hash === 'registro') {
        setLoginMode('register');
        setCurrentRoute('login');
      } else {
        // Rota padrão: Landing Page pública com Hero Banner
        setCurrentRoute('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: AppRoute, hashValue?: string) => {
    setCurrentRoute(route);
    setAuthRedirectReason(null);
    window.location.hash = hashValue || route;
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('healthtrack_active_user', JSON.stringify(user));
    setAuthRedirectReason(null);
    navigateTo('dashboard', 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('healthtrack_active_user');
    setCurrentUser(null);
    navigateTo('landing', 'landing');
  };

  const handleQuickDemoLogin = async () => {
    try {
      const demo = await userRepo.findByEmail('usuario@saude.com');
      if (demo) {
        handleLoginSuccess(demo);
      } else {
        setLoginMode('login');
        navigateTo('login', 'login');
      }
    } catch {
      setLoginMode('login');
      navigateTo('login', 'login');
    }
  };

  // ================= 1. ROTA PROTEGIDA: DASHBOARD =================
  if (currentRoute === 'dashboard') {
    // Validação estrita: se não estiver autenticado, bloqueia o acesso e redireciona
    if (!currentUser) {
      return (
        <LoginView
          initialMode="login"
          redirectReason="Acesso restrito: você precisa estar autenticado para visualizar o dashboard de saúde."
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => navigateTo('landing', 'landing')}
        />
      );
    }

    return (
      <DashboardView
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateHome={() => navigateTo('landing', 'landing')}
      />
    );
  }

  // ================= 2. ROTA DE AUTENTICAÇÃO: LOGIN =================
  if (currentRoute === 'login') {
    return (
      <LoginView
        initialMode={loginMode}
        redirectReason={authRedirectReason}
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={() => navigateTo('landing', 'landing')}
      />
    );
  }

  // ================= 3. ROTA PÚBLICA INICIAL: LANDING PAGE COM HERO BANNER =================
  return (
    <LandingPage
      isAuthenticated={!!currentUser}
      userName={currentUser?.name}
      onGoToLogin={() => {
        setLoginMode('login');
        navigateTo('login', 'login');
      }}
      onGoToRegister={() => {
        setLoginMode('register');
        navigateTo('login', 'cadastrar');
      }}
      onQuickDemoLogin={handleQuickDemoLogin}
      onGoToDashboard={() => navigateTo('dashboard', 'dashboard')}
    />
  );
}
