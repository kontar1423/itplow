'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCurrentUser,
  getMissions,
  getParticipations,
  getPublicProjects,
  getProjects,
  type ProjectResponseDto,
  type UserResponseDto
} from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Footer from '@/components/layout/Footer';
import CTA from '@/components/layout/CTA';
interface PopularProject extends ProjectResponseDto {
  tasksCount: number;
  participantsCount: number;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null);
  const [popularProjects, setPopularProjects] = useState<PopularProject[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      getCurrentUser()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          localStorage.removeItem('auth_token');
        });
    }
  }, []);

  useEffect(() => {
    const loadPopularProjects = async () => {
      try {
        setIsProjectsLoading(true);
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
        const projects = hasToken ? await getProjects() : await getPublicProjects();

        const withStats = await Promise.all(
          projects.map(async (project) => {
            const [missions, participations] = await Promise.all([
              getMissions(project.id).catch(() => []),
              getParticipations(project.id).catch(() => []),
            ]);

            return {
              ...project,
              tasksCount: missions.length,
              participantsCount: participations.length,
            };
          })
        );

        const sorted = withStats
          .sort((a, b) => {
            if (b.participantsCount !== a.participantsCount) {
              return b.participantsCount - a.participantsCount;
            }
            return b.tasksCount - a.tasksCount;
          })
          .slice(0, 6);

        setPopularProjects(sorted);
      } catch {
        setPopularProjects([]);
      } finally {
        setIsProjectsLoading(false);
      }
    };

    void loadPopularProjects();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-[#f0fdf4] py-16 lg:py-24">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
              Платформа{' '}
              <span className="text-primary">гражданской науки</span>
            </h1>
            <p className="text-md md:text-lg text-muted-foreground mb-7 max-w-2xl mx-auto">
              Объединяем учёных и добровольцев для совместных исследований. 
              Присоединяйтесь к научным проектам и вносите вклад в науку!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/projects">
                <Button size="lg" className="w-full sm:w-auto">
                  Найти проект
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Узнать больше
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Популярные проекты
              </h2>
              <p className="text-muted-foreground">
                Присоединяйтесь к активным исследованиям
              </p>
            </div>
            <Link href="/projects">
              <Button variant="ghost">Все проекты</Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isProjectsLoading && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground">Загрузка проектов...</div>
            )}
            {!isProjectsLoading && popularProjects.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground">Проекты пока не добавлены.</div>
            )}
            {popularProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card variant="outlined" className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                        {project.status === 'active' ? 'Активен' : 'Завершён'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{project.tasksCount} заданий</span>
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {project.participantsCount} участников
                      </span>
                      <span className="text-primary text-sm font-medium group-hover:underline">
                        Подробнее
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <CTA isVisible={!currentUser} />

      <Footer />
    </div>
  );
}
