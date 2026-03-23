'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function MyProjectsPage() {
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer'>('volunteer');

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'volunteer' || savedRole === 'scientist') {
      setUserRole(savedRole);
    }
  }, []);

  const myProjects = [
    {
      id: '1',
      title: 'Мониторинг птиц Москвы и Подмосковья',
      description: 'Наблюдение за миграцией птиц в городских парках и пригородах столицы.',
      role: 'Участник',
      tasksCompleted: 8,
      tasksTotal: 12,
      status: 'active' as const,
    },
    {
      id: '3',
      title: 'Качество воздуха в городах России',
      description: 'Сбор данных о загрязнении воздуха в различных районах городов.',
      role: 'Участник',
      tasksCompleted: 5,
      tasksTotal: 15,
      status: 'active' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Мои проекты</h1>
          <p className="text-muted-foreground">
            Проекты, в которых вы участвуете
          </p>
        </div>

        {myProjects.length === 0 ? (
          <Card variant="outlined" className="text-center py-12">
            <CardContent>
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Вы ещё не участвуете в проектах
              </h3>
              <p className="text-muted-foreground mb-6">
                Найдите интересный проект и примите участие в исследовании
              </p>
              <Link href="/projects">
                <Button>Найти проекты</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <Card key={project.id} variant="outlined" className="h-full hover:shadow-lg hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                      {project.status === 'active' ? 'Активен' : 'Завершён'}
                    </Badge>
                    <Badge variant="outline">{project.role}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Выполнено заданий</span>
                      <span className="font-medium">{project.tasksCompleted}/{project.tasksTotal}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(project.tasksCompleted / project.tasksTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/projects/${project.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Перейти к проекту
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
