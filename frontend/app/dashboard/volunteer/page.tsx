'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import NavItem from '@/components/layout/NavItem';
import { getUserProjects, ProjectResponseDto, getCurrentUser, UserResponseDto, updateCurrentUser, UpdateUserDto } from '@/lib/api/client';

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('my-projects');
  const [myProjects, setMyProjects] = useState<ProjectResponseDto[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [myReports, setMyReports] = useState([
    { id: '1', projectName: 'Мониторинг птиц Москвы', taskName: 'Подсчёт птиц в парке', date: '2024-02-15', status: 'pending', images: 3 },
    { id: '2', projectName: 'Фенологические наблюдения', taskName: 'Фенология растений', date: '2024-02-14', status: 'approved', images: 5 },
    { id: '3', projectName: 'Качество воздуха', taskName: 'Измерение PM2.5', date: '2024-02-14', status: 'rejected', images: 2, rejectReason: 'Неверные данные' },
  ]);
  
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'scientist') {
      router.push('/dashboard/scientist');
    }
  }, [router]);
  
  // Загрузка проектов пользователя
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projects = await getUserProjects();
        setMyProjects(projects);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Загрузка данных пользователя
  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const user = await getCurrentUser();
        setUserEmail(user.email);
        setUserDescription(user.description || '');
        setFormFirstName(user.first_name || '');
        setFormLastName(user.last_name || '');
        setFormDescription(user.description || '');
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateUserDto = {
        first_name: formFirstName,
        last_name: formLastName,
        description: formDescription,
      };
      await updateCurrentUser(updateData);
      alert('Профиль успешно сохранён!');
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      alert('Ошибка сохранения профиля');
    } finally {
      setIsSaving(false);
    }
  };
  
  const savedFirstName = typeof window !== 'undefined' ? localStorage.getItem('user_first_name') : '';
  const savedLastName = typeof window !== 'undefined' ? localStorage.getItem('user_last_name') : '';
  const displayName = savedFirstName && savedLastName 
    ? `${savedFirstName} ${savedLastName}` 
    : savedFirstName || savedLastName || 'Не удалось получить имя';
  
  const user = {
    name: displayName,
    firstName: savedFirstName || '',
    lastName: savedLastName || '',
    email: 'anna@example.ru',
    role: 'volunteer' as const,
    nickname: 'annavolunteer',
    description: 'Любитель природы, участвую в наблюдениях за птицами',
    avatar: null,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-screen hidden lg:block">
          <div className="p-6">
            {/*Базовая информация*/}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Avatar fallback={user.name} size="lg" />
              <div>
                <div className="font-medium text-foreground">{user.name}</div>
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
                badge={myProjects.length > 0 ? myProjects.length : undefined}
              />
              <NavItem 
                active={activeTab === 'my-reports'} 
                onClick={() => setActiveTab('my-reports')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
                label="Мои отчёты"
                badge={5}
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
              {activeTab === 'projects' && 'Найти проекты'}
              {activeTab === 'profile' && 'Профиль'}
              {activeTab === 'settings' && 'Настройки'}
            </h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {user.name}!
            </p>
          </div>
          
          {activeTab === 'my-reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Мои отчёты</h2>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>На проверке: {myReports.filter(r => r.status === 'pending').length}</span>
                  <span>|</span>
                  <span>Принято: {myReports.filter(r => r.status === 'approved').length}</span>
                  <span>|</span>
                  <span>Отклонено: {myReports.filter(r => r.status === 'rejected').length}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {myReports.map((report) => (
                  <Card key={report.id} variant="outlined" className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{report.taskName}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {report.projectName}
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          {report.images} фото
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {report.date}
                        </span>
                      </div>
                      {report.rejectReason && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                          Причина отклонения: {report.rejectReason}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'my-projects' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Мои проекты</h2>
              </div>
              
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : myProjects.length === 0 ? (
                <Card variant="outlined" className="text-center py-12">
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Вы ещё не участвуете в проектах
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Присоединяйтесь к исследовательским проектам
                    </p>
                    <Link href="/projects">
                      <Button>Найти проекты</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myProjects.map((project) => (
                    <Card key={project.id} variant="outlined" className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <Badge variant={project.status === 'active' ? 'success' : 'default'} className="w-fit mb-2">
                          {project.status === 'active' ? 'Активен' : 'Завершён'}
                        </Badge>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            {project.tasks_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            {project.participants_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
                            {project.reports_count || 0}
                          </span>
                        </div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {project.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Link href={`/projects/${project.id}`} className="w-full">
                          <Button variant="outline" className="w-full">Открыть</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'profile' && (
            <Card variant="outlined" className="max-w-2xl">
              <CardHeader>
                <CardTitle>Редактирование профиля</CardTitle>
              </CardHeader>
              {isLoadingUser ? (
                <CardContent className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              ) : (
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Имя</label>
                    <input 
                      type="text" 
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Фамилия</label>
                    <input 
                      type="text" 
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">О себе</label>
                    <textarea 
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <div className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground">
                      {isLoadingUser ? 'Загрузка...' : userEmail}
                    </div>
                  </div>
                </div>
              </CardContent>
              )}
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </CardFooter>
            </Card>
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