'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import NavItem from '@/components/layout/NavItem';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import ScientistProjectsPanel from '@/components/dashboard/scientist/ScientistProjectsPanel';
import ScientistReportsPanel from '@/components/dashboard/scientist/ScientistReportsPanel';
import ProfilePanel from '@/components/dashboard/ProfilePanel';

function getStoredUserName(): string {
  if (typeof window === 'undefined') {
    return 'Пользователь';
  }

  const firstName = localStorage.getItem('user_first_name') || '';
  const lastName = localStorage.getItem('user_last_name') || '';
  return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Пользователь';
}

const emptySubscribe = () => () => {};

const subscribeUserName = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('auth-changed', handler);
  window.addEventListener('focus', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('auth-changed', handler);
    window.removeEventListener('focus', handler);
  };
};
export default function ScientistDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const userName = useSyncExternalStore(typeof window === 'undefined' ? emptySubscribe : subscribeUserName, getStoredUserName, () => 'Пользователь');

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'volunteer') {
      router.push('/dashboard/volunteer');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-screen hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Avatar fallback={userName} size="lg" />
              <div>
                <div className="font-medium text-foreground">{userName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
                  Ученый
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <NavItem active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>} label="Мои проекты" />
              <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>} label="Отчеты" />
              <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="Профиль" />
              <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} label="Настройки" />
            </nav>
          </div>

          <div className="p-6 border-t border-border">
            <Button variant="ghost" className="w-full justify-start" onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.href = '/';
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Выйти
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-3 sm:p-4 md:p-8">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
              <Avatar fallback={userName} size="md" />
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{userName}</div>
                <div className="text-sm text-muted-foreground">Учёный</div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 lg:hidden">
            <button type="button" onClick={() => setActiveTab('projects')} className={`rounded-2xl px-3 py-3 text-sm font-medium ${activeTab === 'projects' ? 'bg-primary text-white' : 'border border-border bg-white text-foreground'}`}>Мои проекты</button>
            <button type="button" onClick={() => setActiveTab('reports')} className={`rounded-2xl px-3 py-3 text-sm font-medium ${activeTab === 'reports' ? 'bg-primary text-white' : 'border border-border bg-white text-foreground'}`}>Отчёты</button>
            <button type="button" onClick={() => setActiveTab('profile')} className={`rounded-2xl px-3 py-3 text-sm font-medium ${activeTab === 'profile' ? 'bg-primary text-white' : 'border border-border bg-white text-foreground'}`}>Профиль</button>
            <button type="button" onClick={() => setActiveTab('settings')} className={`rounded-2xl px-3 py-3 text-sm font-medium ${activeTab === 'settings' ? 'bg-primary text-white' : 'border border-border bg-white text-foreground'}`}>Настройки</button>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
              {activeTab === 'projects' && 'Мои проекты'}
              {activeTab === 'reports' && 'Отчеты'}
              {activeTab === 'profile' && 'Профиль'}
              {activeTab === 'settings' && 'Настройки'}
            </h1>
          </div>

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link href="/projects/create">
                  <Button className="w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Создать проект
                  </Button>
                </Link>
              </div>
              <ScientistProjectsPanel />
            </div>
          )}

          {activeTab === 'reports' && <ScientistReportsPanel />}
          {activeTab === 'profile' && <ProfilePanel className="w-full max-w-2xl" />}

          {activeTab === 'settings' && (
            <div className="w-full max-w-2xl space-y-6">
              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>Настройка уведомлений</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-foreground">Email-уведомления</div>
                      <div className="text-sm text-muted-foreground">Получать новости на email</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-foreground">Уведомления о новых отчетах</div>
                      <div className="text-sm text-muted-foreground">Получать уведомления о новых отчетах</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

