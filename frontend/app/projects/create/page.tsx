'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { createProject, CreateProjectDto } from '@/lib/api/client';

export default function CreateProjectPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    setUserRole(savedRole as 'scientist' | 'volunteer');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const projectData: CreateProjectDto = {
      title: formData.title,
      description: formData.description,
      status: 'active',
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      await createProject(projectData);
      setIsSubmitting(false);
      // Перенаправляем на дашборд ученого после успешного создания
      router.push('/dashboard/scientist');
    } catch (err) {
      setIsSubmitting(false);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания проекта';
      setError(errorMessage);
      console.error('Ошибка создания проекта:', err);
    }
  };

  if (userRole !== 'scientist') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="flex justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M10 2v7.31"/>
                <path d="M14 9.3V1.99"/>
                <path d="M8.5 2h7"/>
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
                <path d="M5.52 16h12.96"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Доступ ограничен
            </h2>
            <p className="text-muted-foreground mb-6">
              Создавать проекты могут только учёные. Зарегистрируйтесь как учёный для доступа к этой функции.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/">
                <Button variant="outline">На главную</Button>
              </Link>
              <Link href="/auth/register?role=scientist">
                <Button>Стать учёным</Button>
              </Link>
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
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/dashboard" className="hover:text-primary">Личный кабинет</Link>
            <span>/</span>
            <span className="text-foreground">Создание проекта</span>
          </nav>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-2xl">Создание нового проекта</CardTitle>
              <CardDescription>
                Заполните форму для создания проекта гражданской науки
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <div>
                        <p className="font-medium">Ошибка создания проекта</p>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Input
                  label="Название проекта"
                  name="title"
                  placeholder=""
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание проекта
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    placeholder="Опишите цели проекта, методы исследования и ожидаемые результаты..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Теги"
                  name="tags"
                  placeholder="Экология, Биология, Орнитология (через запятую)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  helperText="Введите теги через запятую для категоризации проекта"
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">Отмена</Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting}>
                  Создать проект
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
