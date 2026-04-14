'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { getProjectById, getMissions, getObservations, updateMission, updateProject, joinProject, getCurrentUser, getUserById, ProjectResponseDto, MissionResponseDto, UserResponseDto, UpdateMissionDto, UpdateProjectDto } from '@/lib/api/client';

interface ExtendedProject extends ProjectResponseDto {
  isJoined: boolean;
  isOwner: boolean;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  requiredFields: string[];
  status: string;
  observationsCount: number;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    requirements: '',
    status: 'active',
  });
  const [projectOwner, setProjectOwner] = useState<UserResponseDto | null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    description: '',
    tags: '',
    status: 'active',
  });
  
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем текущего пользователя
      let user: UserResponseDto | null = null;
      try {
        user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        // Пользователь не авторизован
      }
      
      const projectData = await getProjectById(projectId);
      
      // Загружаем данные владельца проекта
      try {
        const owner = await getUserById(projectData.user_id);
        setProjectOwner(owner);
      } catch {
        setProjectOwner(null);
      }
      
      // Проверяем, является ли пользователь владельцем проекта
      const isProjectOwner = user && projectData.user_id === user.id;
      setIsOwner(isProjectOwner || false);
      
      setProject({
        ...projectData,
        isJoined,
        isOwner: isProjectOwner || false,
      } as ExtendedProject);

      const missionsData = await getMissions(projectId);
      
      // Получаем количество наблюдений для каждого задания
      const tasksWithObs = await Promise.all(
        missionsData.map(async (m) => {
          let obsCount = 0;
          try {
            const observations = await getObservations(projectId, m.id);
            obsCount = observations.length;
          } catch {
            // Если не удалось получить наблюдения, оставляем 0
          }
          
          return {
            id: m.id,
            title: m.title,
            description: m.description,
            requiredFields: m.requirements ? m.requirements.split(',') : [],
            status: m.status,
            observationsCount: obsCount,
          };
        })
      );
      
      setTasks(tasksWithObs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проекта');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await joinProject(projectId);
      setIsJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка вступления в проект');
    } finally {
      setIsJoining(false);
    }
  };

  const handleEditTask = (task: TaskData) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      requirements: task.requiredFields.join(', '),
      status: task.status,
    });
  };

  const handleSaveTask = async () => {
    if (!editingTask) return;
    
    try {
      setIsSaving(true);
      const missionData: UpdateMissionDto = {
        title: editForm.title,
        description: editForm.description,
        requirements: editForm.requirements,
        status: editForm.status,
      };
      
      await updateMission(projectId, editingTask.id, missionData);
      
      // Обновляем список заданий
      await loadProject();
      setEditingTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения задания');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
  };

  const handleEditProject = () => {
    if (!project) return;
    setEditingProject(true);
    setEditProjectForm({
      title: project.title,
      description: project.description,
      tags: project.tags.join(', '),
      status: project.status,
    });
  };

  const handleSaveProject = async () => {
    try {
      setIsSavingProject(true);
      const projectData: UpdateProjectDto = {
        title: editProjectForm.title,
        description: editProjectForm.description,
        tags: editProjectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: editProjectForm.status,
      };
      
      await updateProject(projectId, projectData);
      
      // Обновляем данные проекта
      await loadProject();
      setEditingProject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения проекта');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleCloseEditProjectModal = () => {
    setEditingProject(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Проект не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header проекта */}
      <div className="bg-[#f0fdf4] py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/*Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/projects" className="hover:text-primary">Проекты</Link>
              <span>/</span>
              <span className="text-foreground">{project.title}</span>
            </nav>
            
            {/* Заголовок и статус */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                    {project.status === 'active' ? 'Активен' : 'Завершён'}
                  </Badge>
                  {isJoined && (
                    <Badge variant="primary">Вы участник</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {project.title}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {project.description}
                </p>
              </div>
              
              <div className="flex gap-3">
                {project.status === 'active' && !isJoined && !isOwner && (
                  <Button onClick={handleJoin} isLoading={isJoining}>
                    Присоединиться
                  </Button>
                )}
                {isOwner && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span className="text-sm font-medium text-green-700">Ваш проект</span>
                  </div>
                )}
                {isOwner && (
                  <Button variant="outline" onClick={handleEditProject}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Редактировать проект
                  </Button>
                )}
              </div>
            </div>
            
            {/* Теги */}
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Левая колонка - Задания */}
              <div className="lg:col-span-2 space-y-6">
                <Card variant="outlined">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Задания</CardTitle>
                        <CardDescription>
                          {tasks.length} заданий доступно
                        </CardDescription>
                      </div>
                      {isOwner && (
                        <Link href={`/projects/${project.id}/tasks/create`}>
                          <Button variant="outline" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="16"/>
                              <line x1="8" y1="12" x2="16" y2="12"/>
                            </svg>
                            Добавить задание
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <p className="text-muted-foreground">Заданий пока нет</p>
                    ) : (
                      <div className="space-y-4">
                        {tasks.map((task) => (
                          <div key={task.id} className="p-4 rounded-lg border border-border hover:border-primary transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <CardTitle className="text-base">{task.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                  </svg>
                                  <span>{task.observationsCount}</span>
                                </div>
                                {isOwner && (
                                  <button
                                    onClick={() => handleEditTask(task)}
                                    className="p-1 hover:text-primary transition-colors"
                                    title="Редактировать задание"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </button>
                                )}
                                <Badge variant={task.status === 'active' ? 'success' : 'default'}>
                                  {task.status === 'active' ? 'Активно' : 'Завершено'}
                                </Badge>
                              </div>
                            </div>
                            <CardDescription className="text-sm mb-2">
                              {task.description}
                            </CardDescription>
                            {task.requiredFields.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.requiredFields.map((field, idx) => (
                                  <Badge key={idx} variant="secondary" size="sm">
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {isJoined && (
                              <Link href={`/projects/${project.id}/tasks/${task.id}`} className="mt-3 block">
                                <Button variant="outline" size="sm" className="w-full">
                                  Выполнить
                                </Button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Правая колонка */}
              <div className="space-y-6">
                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Организатор</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projectOwner ? (
                      <div className="flex items-center gap-4">
                        <Avatar 
                          fallback={projectOwner.first_name && projectOwner.last_name 
                            ? `${projectOwner.first_name.charAt(0)}${projectOwner.last_name.charAt(0)}` 
                            : 'User'} 
                          size="lg" 
                        />
                        <div>
                          <div className="font-semibold text-foreground">
                            {projectOwner.first_name} {projectOwner.last_name}
                          </div>
                          {projectOwner.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {projectOwner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Avatar fallback="User" size="lg" />
                        <div>
                          <div className="font-semibold text-foreground">Автор проекта</div>
                          <div className="text-sm text-muted-foreground">Учёный</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {projectOwner && (projectOwner.phone || projectOwner.email) && (
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setShowContacts(!showContacts)}
                      >
                        {showContacts ? 'Скрыть контакты' : 'Показать контакты'}
                      </Button>
                    </CardFooter>
                  )}
                  {showContacts && projectOwner && (
                    <div className="px-6 pb-4 pt-2 space-y-2 border-t border-border">
                      {projectOwner.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                          <a href={`mailto:${projectOwner.email}`} className="text-primary hover:underline">
                            {projectOwner.email}
                          </a>
                        </div>
                      )}
                      {projectOwner.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          <a href={`tel:${projectOwner.phone}`} className="text-primary hover:underline">
                            {projectOwner.phone}
                          </a>
                        </div>
                      )}
                      {!projectOwner.phone && !projectOwner.email && (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          Контактная информация не указана
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования задания */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseEditModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Редактирование задания</h2>
                <button
                  onClick={handleCloseEditModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Название задания
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание задания
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Требования к отчёту
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Перечислите требования к отчёту (через запятую): текст, фото, местоположение..."
                    value={editForm.requirements}
                    onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Статус задания
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Активно</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Отмена
                </Button>
                <Button onClick={handleSaveTask} isLoading={isSaving}>
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования проекта */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseEditProjectModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Редактирование проекта</h2>
                <button
                  onClick={handleCloseEditProjectModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Название проекта
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editProjectForm.title}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание проекта
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    value={editProjectForm.description}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Теги
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Экология, Биология, Орнитология (через запятую)"
                    value={editProjectForm.tags}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, tags: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Статус проекта
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editProjectForm.status}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, status: e.target.value })}
                  >
                    <option value="active">Активен</option>
                    <option value="completed">Завершён</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={handleCloseEditProjectModal}>
                  Отмена
                </Button>
                <Button onClick={handleSaveProject} isLoading={isSavingProject}>
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
