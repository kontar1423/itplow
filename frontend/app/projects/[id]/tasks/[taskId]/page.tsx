'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getMissionById, createObservation, CreateObservationDto } from '@/lib/api/client';

export default function TaskPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const taskId = params?.taskId as string;
  const router = useRouter();
  
  const [task, setTask] = useState<{ id: string; title: string; description: string; requirements: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (projectId && taskId) {
      loadTask();
    }
  }, [projectId, taskId]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const missionData = await getMissionById(projectId, taskId);
      setTask(missionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки задания');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const observationData: CreateObservationDto = {
      title: formData.title,
      description: formData.description,
    };
    
    try {
      await createObservation(projectId, taskId, observationData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Ошибка отправки отчёта');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <Card variant="elevated" className="text-center py-12">
              <div className="flex justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <CardTitle className="text-2xl mb-2">Отчёт отправлен!</CardTitle>
              <CardDescription className="mb-6">
                Спасибо за ваш вклад в исследование. Ваш отчёт будет проверен учёным.
              </CardDescription>
              <div className="flex justify-center gap-4">
                <Link href={`/projects/${projectId}`}>
                  <Button variant="outline">К проекту</Button>
                </Link>
                <Button onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ title: '', description: '' });
                }}>
                  Отправить ещё один
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Задание не найдено</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/projects" className="hover:text-primary">Проекты</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}`} className="hover:text-primary">Проект</Link>
            <span>/</span>
            <span className="text-foreground">{task.title}</span>
          </nav>

          <Card variant="outlined" className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{task.description}</p>
              {task.requirements && (
                <div className="mt-4">
                  <Badge variant="secondary">Требования: {task.requirements}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Отправить отчёт</CardTitle>
              <CardDescription>
                Заполните форму ниже для выполнения задания
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Название наблюдения
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Например: Наблюдение в парке Сокольники"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    placeholder="Опишите ваши наблюдения подробно..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Link href={`/projects/${projectId}`}>
                  <Button variant="outline" type="button">Отмена</Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting}>
                  Отправить отчёт
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
