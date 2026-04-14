'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { getCurrentUser, getMissions, getParticipations, getProjects, ProjectResponseDto } from '@/lib/api/client';

function canCreateProject(role?: string): boolean {
  return role === 'admin' || role === 'scientist';
}

function formatTasksCount(count: number): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) {
    return `${count} заданий`;
  }
  if (last === 1) {
    return `${count} задание`;
  }
  if (last >= 2 && last <= 4) {
    return `${count} задания`;
  }
  return `${count} заданий`;
}

function formatParticipantsCount(count: number): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) {
    return `${count} участников`;
  }
  if (last === 1) {
    return `${count} участник`;
  }
  if (last >= 2 && last <= 4) {
    return `${count} участника`;
  }
  return `${count} участников`;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [participantProjectIds, setParticipantProjectIds] = useState<Set<string>>(new Set());
  const [isVolunteerViewer, setIsVolunteerViewer] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [projectsData, currentUser] = await Promise.all([
          getProjects(),
          getCurrentUser().catch(() => null),
        ]);

        const localRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
        const volunteerByStorage = localRole === 'volunteer';
        const volunteerByApi = currentUser?.role === 'user' && localRole !== 'scientist';
        setIsVolunteerViewer(volunteerByStorage || volunteerByApi);

        const currentUserId = currentUser?.id;
        const joinedProjectIds = new Set<string>();
        currentUser?.participations?.forEach((participation) => joinedProjectIds.add(participation.project_id));

        const projectsWithStats = await Promise.all(
          projectsData.map(async (project) => {
            const output: ProjectResponseDto = { ...project };

            if (typeof output.tasks_count !== 'number') {
              try {
                const tasks = await getMissions(project.id);
                output.tasks_count = tasks.length;
              } catch {
                output.tasks_count = 0;
              }
            }

            try {
              const participations = await getParticipations(project.id);
              output.participants_count = participations.length;
              if (currentUserId && participations.some((participant) => participant.user_id === currentUserId)) {
                joinedProjectIds.add(project.id);
              }
            } catch {
              if (typeof output.participants_count !== 'number') {
                output.participants_count = 0;
              }
            }

            return output;
          })
        );

        setParticipantProjectIds(joinedProjectIds);
        setProjects(projectsWithStats);
        setShowCreateProject(canCreateProject(currentUser?.role));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return projects;
    }

    return projects.filter((project) => {
      const inTitle = project.title.toLowerCase().includes(query);
      const inDescription = project.description.toLowerCase().includes(query);
      const inTags = project.tags.some((tag) => tag.toLowerCase().includes(query));
      return inTitle || inDescription || inTags;
    });
  }, [projects, search]);

  return (
    <div className="min-h-screen">
      <div className="bg-[#f0fdf4] py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Проекты гражданской науки</h1>
            <p className="text-muted-foreground mb-8">Ищите проекты по названию, описанию или тегу и присоединяйтесь как волонтер.</p>
            <SearchBar
              placeholder="Поиск по названию или тегу..."
              onSearch={setSearch}
              initialValue={search}
            />
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8 gap-4">
            <h2 className="text-xl font-semibold text-foreground">Найдено проектов: {filteredProjects.length}</h2>
            {showCreateProject && (
              <Link href="/projects/create">
                <Button variant="outline">Создать проект</Button>
              </Link>
            )}
          </div>

          {isLoading && <div className="text-center py-16 text-muted-foreground">Загрузка...</div>}

          {!isLoading && error && (
            <div className="text-center py-16">
              <p className="text-red-600 mb-6">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Повторить</Button>
            </div>
          )}

          {!isLoading && !error && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-2">Проекты не найдены</h3>
              <p className="text-muted-foreground mb-6">Измените запрос или очистите поиск.</p>
              <Button variant="outline" onClick={() => setSearch('')}>Очистить поиск</Button>
            </div>
          )}

          {!isLoading && !error && filteredProjects.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card variant="outlined" className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                            {project.status === 'active' ? 'Активен' : 'Неактивен'}
                          </Badge>
                          {isVolunteerViewer && participantProjectIds.has(project.id) && (
                            <Badge variant="primary">Вы участвуете</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{formatTasksCount(project.tasks_count ?? 0)}</span>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between text-sm text-muted-foreground">
                      <span>{formatParticipantsCount(project.participants_count ?? 0)}</span>
                      <span className="text-primary font-medium group-hover:underline">Подробнее →</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
