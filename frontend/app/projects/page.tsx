'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import Badge from '@/components/ui/Badge';
import { getProjects, ProjectResponseDto } from '@/lib/api/client';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов');
    } finally {
      setIsLoading(false);
    }
  };
  
  const categories = [
    'Все',
    'Экология',
    'Биология',
    'Астрономия',
    'Метеорология',
    'География',
  ];
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Все' || 
                           project.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Заголовок */}
      <div className="bg-[#f0fdf4] py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Проекты гражданской науки
            </h1>
            <p className="text-muted-foreground mb-8">
              Найдите интересный проект и примите участие в исследовании
            </p>
            <SearchBar 
              placeholder="Поиск по названию или описанию..."
              onSearch={(query) => setSearchQuery(query)}
              initialValue={searchQuery}
            />
          </div>
        </div>
      </div>

      {/* Категории */}
      <div className="py-6">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'Все' ? null : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (selectedCategory === category || (!selectedCategory && category === 'Все'))
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Список проектов */}
      <div className="py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              Найдено проектов: {filteredProjects.length}
            </h2>
            <select className="px-4 py-2 rounded-lg border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Сначала новые</option>
              <option>Сначала популярные</option>
              <option>По количеству участников</option>
            </select>
          </div>
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Проекты не найдены
              </h3>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить параметры поиска
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Очистить поиск
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card variant="outlined" className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                          {project.status === 'active' ? 'Активен' : 'Завершён'}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          {project.tasks_count || 0} заданий
                        </span>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            {project.participants_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                            {project.reports_count || 0}
                          </span>
                        </div>
                        <span className="text-primary font-medium text-sm group-hover:underline">
                          Подробнее →
                        </span>
                      </div>
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

const sampleProjects = [
  {
    id: '1',
    title: 'Мониторинг птиц Москвы и Подмосковья',
    description: 'Наблюдение за миграцией птиц в городских парках и пригородах столицы. Участники фиксируют видовой состав, численность и поведение пернатых.',
    tags: ['Экология', 'Орнитология'],
    status: 'active' as const,
    tasksCount: 12,
    participants: 156,
    reportsCount: 1240,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Фенологические наблюдения',
    description: 'Отслеживание сезонных изменений в природе: цветение растений, листопад, прилёт и отлёт птиц, сроки появления насекомых.',
    tags: ['Биология', 'Климат'],
    status: 'active' as const,
    tasksCount: 8,
    participants: 89,
    reportsCount: 567,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    title: 'Качество воздуха в городах России',
    description: 'Сбор данных о загрязнении воздуха в различных районах городов с использованием волонтёрских измерений.',
    tags: ['Экология', 'Метеорология'],
    status: 'active' as const,
    tasksCount: 15,
    participants: 234,
    reportsCount: 3210,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    title: 'Наблюдение за звёздным небом',
    description: 'Фиксирование астрономических явлений, метеоров, а также светового загрязнения в разных регионах страны.',
    tags: ['Астрономия'],
    status: 'active' as const,
    tasksCount: 6,
    participants: 67,
    reportsCount: 234,
    createdAt: '2024-03-01',
  },
  {
    id: '5',
    title: 'Мониторинг водоёмов',
    description: 'Исследование состояния рек и озёр: качество воды, флора и фауна, антропогенное воздействие.',
    tags: ['Экология', 'Биология'],
    status: 'active' as const,
    tasksCount: 10,
    participants: 112,
    reportsCount: 890,
    createdAt: '2024-02-15',
  },
  {
    id: '6',
    title: 'Гражданская археология',
    description: 'Документирование исторических объектов, сбор информации о памятниках культуры и их состоянии.',
    tags: ['География', 'История'],
    status: 'inactive' as const,
    tasksCount: 20,
    participants: 345,
    reportsCount: 1560,
    createdAt: '2023-11-01',
  },
];
