'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { createMission, CreateMissionDto } from '@/lib/api/client';

export default function CreateTaskPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
  });

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    setUserRole(savedRole as 'scientist' | 'volunteer');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const missionData: CreateMissionDto = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      status: 'active',
    };
    
    try {
      await createMission(projectId, missionData);
      setIsSubmitting(false);
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Ошибка создания задания');
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
              Создавать задания могут только учёные. Зарегистрируйтесь как учёный для доступа к этой функции.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/">
                <Button variant="outline">На главную</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Регистрация</Button>
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
            <Link href="/projects" className="hover:text-primary">Проекты</Link>
            <span>/</span>
            <Link href={`/projects/${projectId}`} className="hover:text-primary">Проект</Link>
            <span>/</span>
            <span className="text-foreground">Добавить задание</span>
          </nav>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-2xl">Добавление нового задания</CardTitle>
              <CardDescription>
                Создайте задание для участников проекта
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                <Input
                  label="Название задания"
                  name="title"
                  placeholder=""
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание задания
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    placeholder="Подробно опишите задание: что нужно сделать, как фиксировать данные, какие инструменты понадобятся..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Link href={`/projects/${projectId}`}>
                  <Button variant="outline" type="button">Отмена</Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting}>
                  Создать задание
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
