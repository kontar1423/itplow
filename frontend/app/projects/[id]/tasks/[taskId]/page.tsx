'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createObservation, CreateObservationDto, getMissionById, MissionResponseDto } from '@/lib/api/client';

export default function TaskPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const taskId = params?.taskId as string;

  const [mission, setMission] = useState<MissionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const loadMission = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await getMissionById(projectId, taskId);
        setMission(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки задания');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && taskId) {
      void loadMission();
    }
  }, [projectId, taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload: CreateObservationDto = {
      title: formData.title,
      description: formData.description,
    };

    try {
      await createObservation(projectId, taskId, payload);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки наблюдения');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка...</div>;
  }

  if (!mission) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Задание не найдено</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-10 max-w-2xl">
          <Card variant="elevated" className="text-center py-10">
            <CardTitle className="text-2xl mb-2">Наблюдение отправлено</CardTitle>
            <CardDescription className="mb-6">Спасибо, ваш отчет ушел на проверку организатору проекта.</CardDescription>
            <div className="flex justify-center gap-3">
              <Link href={`/projects/${projectId}`}><Button variant="outline">К проекту</Button></Link>
              <Button onClick={() => {
                setIsSubmitted(false);
                setFormData({ title: '', description: '' });
              }}>
                Отправить еще
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8 max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/projects" className="hover:text-primary">Проекты</Link>
          <span>/</span>
          <Link href={`/projects/${projectId}`} className="hover:text-primary">Проект</Link>
          <span>/</span>
          <span className="text-foreground">{mission.title}</span>
        </nav>

        <Card variant="outlined" className="mb-6">
          <CardHeader>
            <CardTitle>{mission.title}</CardTitle>
            <CardDescription>{mission.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Требования: {mission.requirements || 'Не указаны'}</Badge>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Отправить наблюдение</CardTitle>
            <CardDescription>Заполните форму по результатам выполнения задания.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Название наблюдения</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-input"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Описание</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-input min-h-[140px]"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Link href={`/projects/${projectId}`}><Button type="button" variant="outline">Отмена</Button></Link>
              <Button type="submit" isLoading={isSubmitting}>Отправить</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
