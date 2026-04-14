'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { createMission, CreateMissionDto, getCurrentUser, getProjectById } from '@/lib/api/client';

export default function CreateTaskPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const [user, project] = await Promise.all([getCurrentUser(), getProjectById(projectId)]);
        const allowed = user.id === project.user_id || user.role === 'admin';
        setIsAllowed(allowed);
      } catch {
        setIsAllowed(false);
      }
    };

    if (projectId) {
      void checkAccess();
    }
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload: CreateMissionDto = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      status: 'active',
    };

    try {
      await createMission(projectId, payload);
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания задания');
      setIsSubmitting(false);
    }
  };

  if (isAllowed === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Проверка доступа...</div>;
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Доступ ограничен</h2>
          <p className="text-muted-foreground mb-6">Создавать задания может только владелец проекта.</p>
          <Link href={`/projects/${projectId}`}><Button variant="outline">Вернуться к проекту</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/projects" className="hover:text-primary">Проекты</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}`} className="hover:text-primary">Проект</Link>
            <span>/</span>
            <span className="text-foreground">Новое задание</span>
          </nav>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-2xl">Создать задание</CardTitle>
              <CardDescription>Сформулируйте задачу и требования к наблюдению для волонтеров.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

                <Input
                  label="Название задания"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Описание</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px]"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Требования к отчету</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    placeholder="Например: текст наблюдения, ссылка на фото, место"
                    value={formData.requirements}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Link href={`/projects/${projectId}`}><Button type="button" variant="outline">Отмена</Button></Link>
                <Button type="submit" isLoading={isSubmitting}>Создать задание</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
