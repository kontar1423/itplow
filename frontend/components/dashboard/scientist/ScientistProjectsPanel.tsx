'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getUserProjects, ProjectResponseDto } from '@/lib/api/client';

interface ProjectStats {
  tasks: number;
  participants: number;
  reports: number;
}

export default function ScientistProjectsPanel() {
  const [projects, setProjects] = useState<(ProjectResponseDto & ProjectStats)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getUserProjects();
        const projectsWithStats = data.map(p => ({
          ...p,
          tasks: Math.floor(Math.random() * 15) + 5,
          participants: Math.floor(Math.random() * 200) + 50,
          reports: Math.floor(Math.random() * 1000) + 100,
        }));
        setProjects(projectsWithStats);
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
        <p className="text-muted-foreground mb-4">У вас пока нет проектов</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} variant="outlined" className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                {project.status === 'active' ? 'Активен' : 'Завершён'}
              </Badge>
            </div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                {project.tasks}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {project.participants}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
                {project.reports}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/projects/${project.id}`} className="w-full">
              <Button variant="outline" className="w-full">Открыть</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}