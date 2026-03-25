'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import NavItem from '@/components/layout/NavItem';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import MyProjectsPanel from '@/components/dashboard/volunteer/MyProjectsPanel';
import MyReportsPanel from '@/components/dashboard/volunteer/MyReportsPanel';
import ProfilePanel from '@/components/dashboard/volunteer/ProfilePanel';

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-projects');
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'scientist') {
      router.push('/dashboard/scientist');
    }
    
    const firstName = localStorage.getItem('user_first_name') || '';
    const lastName = localStorage.getItem('user_last_name') || '';
    const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Пользователь';
    setUserName(name);
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-screen hidden lg:block">
          <div className="p-6">
            {/*Базовая информация*/}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Avatar fallback={userName} size="lg" />
              <div>
                <div className="font-medium text-foreground">{userName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Волонтёр
                </div>
              </div>
            </div>
            
            {/*Боковая панель навигации*/}
            <nav className="space-y-1">
              <NavItem 
                active={activeTab === 'my-projects'} 
                onClick={() => setActiveTab('my-projects')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
                label="Мои проекты"
              />
              <NavItem 
                active={activeTab === 'my-reports'} 
                onClick={() => setActiveTab('my-reports')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
                label="Мои отчёты"
              />
              <NavItem 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                label="Профиль"
              />
              <NavItem 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
                label="Настройки"
              />
            </nav>
          </div>
          
          {/*Кнопка выйти*/}
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
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {activeTab === 'my-projects' && 'Мои проекты'}
              {activeTab === 'my-reports' && 'Мои отчёты'}
              {activeTab === 'profile' && 'Профиль'}
              {activeTab === 'settings' && 'Настройки'}
            </h1>
          </div>
          
          {activeTab === 'my-reports' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Мои отчёты</h2>
              <MyReportsPanel />
            </div>
          )}
          
          {activeTab === 'my-projects' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Мои проекты</h2>
              <MyProjectsPanel />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <ProfilePanel />
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>
                    Настройка уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Email-уведомления</div>
                      <div className="text-sm text-muted-foreground">Получать новости на email</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Уведомления о новых задачах</div>
                      <div className="text-sm text-muted-foreground">Получать уведомления о новых задачах</div>
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