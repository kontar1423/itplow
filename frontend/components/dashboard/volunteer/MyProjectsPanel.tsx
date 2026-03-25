'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getUserProjects, ProjectResponseDto } from '@/lib/api/client';

export default function MyProjectsPanel() {
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getUserProjects();
        setProjects(data);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <p className="text-muted-foreground mb-4">Вы пока не участвуете в проектах</p>
        <Link href="/projects">
          <Button>Найти проекты</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} variant="outlined" className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="mt-1">
                  {project.description}
                </CardDescription>
              </div>
              <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                {project.status === 'active' ? 'Активен' : 'Завершён'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            {project.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {project.participants_count || 0} участников
            </div>
            <Link href={`/projects/${project.id}`}>
              <Button variant="outline" size="sm">
                Перейти к проекту
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}