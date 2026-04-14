'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { createProject, CreateProjectDto, getCurrentUser } from '@/lib/api/client';

function isScientistRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'scientist';
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAccessAllowed, setIsAccessAllowed] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    const loadRole = async () => {
      try {
        const user = await getCurrentUser();
        setIsAccessAllowed(isScientistRole(user.role));
      } catch {
        setIsAccessAllowed(false);
      }
    };

    void loadRole();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload: CreateProjectDto = {
      title: formData.title,
      description: formData.description,
      status: 'active',
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      await createProject(payload);
      router.push('/dashboard/scientist');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания проекта');
      setIsSubmitting(false);
    }
  };

  if (isAccessAllowed === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Проверка доступа...</div>;
  }

  if (!isAccessAllowed) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Доступ ограничен</h2>
            <p className="text-muted-foreground mb-6">Создание проектов доступно только роли ученого.</p>
            <div className="flex justify-center gap-3">
              <Link href="/projects"><Button variant="outline">К проектам</Button></Link>
              <Link href="/auth/login"><Button>Войти</Button></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/dashboard/scientist" className="hover:text-primary">Кабинет</Link>
            <span>/</span>
            <span className="text-foreground">Создание проекта</span>
          </nav>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-2xl">Новый проект</CardTitle>
              <CardDescription>Опишите проект и добавьте теги для поиска волонтерами.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

                <Input
                  label="Название"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Описание</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <Input
                  label="Теги"
                  name="tags"
                  placeholder="экология, птицы, город"
                  helperText="Через запятую"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Link href="/dashboard/scientist"><Button type="button" variant="outline">Отмена</Button></Link>
                <Button type="submit" isLoading={isSubmitting}>Создать проект</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
