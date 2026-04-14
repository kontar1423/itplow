'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  getCurrentUser,
  getMissions,
  getParticipations,
  getProjects,
  ProjectResponseDto,
} from '@/lib/api/client';

function formatCount(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;

  if (abs > 10 && abs < 20) {
    return `${count} ${many}`;
  }
  if (last === 1) {
    return `${count} ${one}`;
  }
  if (last >= 2 && last <= 4) {
    return `${count} ${few}`;
  }
  return `${count} ${many}`;
}

export default function MyProjectsPanel() {
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const [user, allProjects] = await Promise.all([getCurrentUser(), getProjects()]);

        const userProjectIds = new Set(user.participations?.map((participation) => participation.project_id) ?? []);
        if (userProjectIds.size === 0) {
          const membershipChecks = await Promise.all(
            allProjects.map(async (project) => {
              try {
                const participations = await getParticipations(project.id);
                return participations.some((participant) => participant.user_id === user.id) ? project.id : null;
              } catch {
                return null;
              }
            })
          );

          membershipChecks.forEach((projectId) => {
            if (projectId) {
              userProjectIds.add(projectId);
            }
          });
        }

        const participantProjects = allProjects.filter((project) => userProjectIds.has(project.id));
        const projectsWithStats = await Promise.all(
          participantProjects.map(async (project) => {
            const output: ProjectResponseDto = { ...project };

            if (typeof output.tasks_count !== 'number') {
              try {
                const missions = await getMissions(project.id);
                output.tasks_count = missions.length;
              } catch {
                output.tasks_count = 0;
              }
            }

            if (typeof output.participants_count !== 'number') {
              try {
                const participations = await getParticipations(project.id);
                output.participants_count = participations.length;
              } catch {
                output.participants_count = 0;
              }
            }

            return output;
          })
        );

        setProjects(projectsWithStats);
      } catch (error) {
        console.error('Ошибка загрузки проектов волонтера:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
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
                {project.status === 'active' ? 'Активен' : 'Неактивен'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCount(project.tasks_count ?? 0, 'задание', 'задания', 'заданий')} • {formatCount(project.participants_count ?? 0, 'участник', 'участника', 'участников')}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
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
