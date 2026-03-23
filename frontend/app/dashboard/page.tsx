'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer'>('scientist');
  
  const [reports, setReports] = useState([
    { id: '1', projectName: 'Мониторинг птиц Москвы', taskName: 'Подсчёт птиц в парке', volunteer: 'Анна Смирнова', date: '2024-02-15', status: 'pending', isNew: true },
    { id: '2', projectName: 'Фенологические наблюдения', taskName: 'Фенология растений', volunteer: 'Михаил Козлов', date: '2024-02-14', status: 'approved', isNew: false },
    { id: '3', projectName: 'Качество воздуха', taskName: 'Измерение PM2.5', volunteer: 'Елена Иванова', date: '2024-02-14', status: 'pending', isNew: true },
    { id: '4', projectName: 'Мониторинг птиц Москвы', taskName: 'Наблюдение за гнездом', volunteer: 'Дмитрий Петров', date: '2024-02-13', status: 'rejected', isNew: false },
    { id: '5', projectName: 'Фенологические наблюдения', taskName: 'Цветение одуванчиков', volunteer: 'Ольга Сидорова', date: '2024-02-12', status: 'approved', isNew: false },
    { id: '6', projectName: 'Качество воздуха', taskName: 'Измерение NO2', volunteer: 'Сергей Николаев', date: '2024-02-11', status: 'pending', isNew: true },
  ]);

  const updateReportStatus = useCallback((reportId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus, isNew: false }
        : report
    ));
  }, []);
  
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'volunteer' || savedRole === 'scientist') {
      setUserRole(savedRole);
    }
  }, []);
  
  const user = {
    name: userRole === 'scientist' ? 'Иван Иванов' : 'Пётр Петров',
    email: userRole === 'scientist' ? 'ivan@example.ru' : 'petr@example.ru',
    role: userRole,
    nickname: userRole === 'scientist' ? 'ivanresearcher' : 'petrvolunteer',
    description: userRole === 'scientist' 
      ? 'Орнитолог, исследователь городской фауны' 
      : 'Любитель природы и наблюдатель за птицами',
    avatar: null,
  };
  
  const isScientist = userRole === 'scientist';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-screen hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Avatar fallback={user.name} size="lg" />
              <div>
                <div className="font-medium text-foreground">{user.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {isScientist ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  )}
                  {isScientist ? 'Учёный' : 'Волонтёр'}
                </div>
              </div>
            </div>
            
            {/* Навигация */}
            <nav className="space-y-1">
              <NavItem 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
                label="Обзор"
              />
              {isScientist ? (
                <>
                  <NavItem 
                    active={activeTab === 'projects'} 
                    onClick={() => setActiveTab('projects')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
                    label="Мои проекты"
                  />
                  <NavItem 
                    active={activeTab === 'create'} 
                    onClick={() => setActiveTab('create')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
                    label="Создать проект"
                  />
                  <NavItem 
                    active={activeTab === 'reports'} 
                    onClick={() => setActiveTab('reports')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
                    label="Отчёты"
                    badge={12}
                  />
                </>
              ) : (
                <>
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
                </>
              )}
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
          
          <div className="p-6 border-t border-border">
            <Button variant="ghost" className="w-full justify-start" onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.reload();
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Выйти
            </Button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {activeTab === 'overview' && 'Обзор'}
              {activeTab === 'projects' && 'Мои проекты'}
              {activeTab === 'create' && 'Создать проект'}
              {activeTab === 'reports' && 'Отчёты'}
              {activeTab === 'my-projects' && 'Мои проекты'}
              {activeTab === 'my-reports' && 'Мои отчёты'}
              {activeTab === 'profile' && 'Профиль'}
              {activeTab === 'settings' && 'Настройки'}
            </h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {user.name}!
            </p>
          </div>
          
          {/* Контент */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Проекты" 
                  value={isScientist ? '3' : '5'} 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
                  color="primary"
                />
                <StatCard 
                  title="Задания" 
                  value={isScientist ? '15' : '8'} 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                  color="secondary"
                />
                <StatCard 
                  title="Отчёты" 
                  value={isScientist ? '127' : '23'} 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  color="success"
                />
                <StatCard 
                  title="Участники" 
                  value={isScientist ? '89' : '-'} 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                  color="warning"
                />
              </div>
              
              {/* Активность */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Последняя активность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: 'Новый отчёт в проекте "Мониторинг птиц"', time: '2 часа назад', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg> },
                        { action: 'Присоединился участник Петров А.', time: '5 часов назад', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                        { action: 'Завершено задание "Подсчёт птиц"', time: 'Вчера', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                        { action: 'Создан проект "Фенология"', time: '3 дня назад', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <div className="text-sm text-foreground">{item.action}</div>
                            <div className="text-xs text-muted-foreground">{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Быстрые действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isScientist ? (
                      <>
                        <Link href="/projects/create" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            Создать новый проект
                          </Button>
                        </Link>
                        <Link href="/projects/1/reports" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                            Проверить отчёты (12)
                          </Button>
                        </Link>
                        <Link href="/profile" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Редактировать профиль
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/projects" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            Найти проекты
                          </Button>
                        </Link>
                        <Link href="/my-projects" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            Мои проекты
                          </Button>
                        </Link>
                        <Link href="/my-reports" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Мои отчёты
                          </Button>
                        </Link>
                        <Link href="/profile" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Редактировать профиль
                          </Button>
                        </Link>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link href="/projects/create">
                  <Button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Создать проект
                  </Button>
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: '1', title: 'Мониторинг птиц Москвы', tasks: 12, participants: 156, reports: 1240, status: 'active' },
                  { id: '2', title: 'Фенологические наблюдения', tasks: 8, participants: 89, reports: 567, status: 'active' },
                  { id: '3', title: 'Качество воздуха', tasks: 15, participants: 234, reports: 3210, status: 'active' },
                ].map((project) => (
                  <Card key={project.id} variant="outlined" className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                          {project.status === 'active' ? 'Активен' : 'Завершён'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          {project.tasks}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          {project.participants}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          {project.reports}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/projects/${project.id}`} className="w-full">
                        <Button variant="outline" className="w-full">Открыть</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Все отчёты</h2>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>На проверке: {reports.filter(r => r.status === 'pending').length}</span>
                  <span>|</span>
                  <span>Принято: {reports.filter(r => r.status === 'approved').length}</span>
                  <span>|</span>
                  <span>Отклонено: {reports.filter(r => r.status === 'rejected').length}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {reports.map((report) => (
                  <Card key={report.id} variant="outlined" className={`hover:shadow-md transition-shadow ${report.isNew ? 'border-primary/50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{report.taskName}</CardTitle>
                            {report.isNew && (
                              <Badge variant="primary">Новое</Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {report.projectName} • {report.volunteer}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.status === 'pending' && (
                            <Badge variant="warning">На проверке</Badge>
                          )}
                          {report.status === 'approved' && (
                            <Badge variant="success">Принято</Badge>
                          )}
                          {report.status === 'rejected' && (
                            <Badge variant="error">Отклонено</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {report.date}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button 
                        variant={report.status === 'approved' ? 'secondary' : 'outline'} 
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'approved')}
                        disabled={report.status === 'approved'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
                        Принять
                      </Button>
                      <Button 
                        variant={report.status === 'rejected' ? 'danger' : 'outline'} 
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'rejected')}
                        disabled={report.status === 'rejected'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Отклонить
                      </Button>
                      {report.status === 'rejected' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'pending')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                          На проверку
                        </Button>
                      )}
                      {report.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'pending')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                          На проверку
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <Card variant="outlined" className="max-w-2xl">
              <CardHeader>
                <CardTitle>Редактирование профиля</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <Avatar fallback={user.name} size="xl" />
                  <Button variant="outline">Изменить аватар</Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Имя</label>
                    <input 
                      type="text" 
                      defaultValue={user.name}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Никнейм</label>
                    <input 
                      type="text" 
                      defaultValue={user.nickname}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">О себе</label>
                    <textarea 
                      defaultValue={user.description}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Сохранить изменения</Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ 
  active, 
  onClick, 
  icon, 
  label, 
  badge 
}: { 
  active: boolean; 
  onClick: () => void;
  icon: React.ReactNode; 
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-colors ${
        active 
          ? 'bg-primary-light text-primary-dark font-medium' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </span>
      {badge && (
        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}) {
  const colors = {
    primary: 'bg-primary-light text-primary-dark',
    secondary: 'bg-secondary-light text-secondary-hover',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  };
  
  return (
    <Card variant="outlined" className="p-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
    </Card>
  );
}
