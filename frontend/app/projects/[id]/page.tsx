'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { getProjectById, getMissions, joinProject, ProjectResponseDto, MissionResponseDto } from '@/lib/api/client';

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
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);
  
  const loadProject = async () => {
    try {
      setIsLoading(true);
      const projectData = await getProjectById(projectId);
      setProject({
        ...projectData,
        isJoined,
        isOwner: false,
      } as ExtendedProject);
      
      const missionsData = await getMissions(projectId);
      setTasks(missionsData.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        requiredFields: m.requirements ? m.requirements.split(',') : [],
        status: m.status,
      })));
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
                {project.status === 'active' && !isJoined && (
                  <Button onClick={handleJoin} isLoading={isJoining}>
                    Присоединиться
                  </Button>
                )}
                {project.status === 'active' && isJoined && (
                  <Link href={`/projects/${project.id}/tasks/create`}>
                    <Button>Создать задание</Button>
                  </Link>
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
                    <CardTitle>Задания</CardTitle>
                    <CardDescription>
                      {tasks.length} заданий доступно
                    </CardDescription>
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
                              <Badge variant={task.status === 'active' ? 'success' : 'default'}>
                                {task.status === 'active' ? 'Активно' : 'Завершено'}
                              </Badge>
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
                    <div className="flex items-center gap-4">
                      <Avatar fallback="User" size="lg" />
                      <div>
                        <div className="font-semibold text-foreground">Автор проекта</div>
                        <div className="text-sm text-muted-foreground">Учёный</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full">
                      Показать контакты
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
