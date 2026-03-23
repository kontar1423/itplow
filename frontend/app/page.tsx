import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

const popularProjects = [
  {
    id: '1',
    title: 'Мониторинг птиц Москвы и Подмосковья',
    description: 'Наблюдение за миграцией птиц в городских парках и пригородах столицы',
    tags: ['Экология', 'Орнитология'],
    status: 'active' as const,
    tasksCount: 12,
    participants: 156,
  },
  {
    id: '2',
    title: 'Фенологические наблюдения',
    description: 'Отслеживание сезонных изменений в природе: цветение, листопад, прилёт птиц',
    tags: ['Биология', 'Климат'],
    status: 'active' as const,
    tasksCount: 8,
    participants: 89,
  },
  {
    id: '3',
    title: 'Качество воздуха в городах',
    description: 'Сбор данных о загрязнении воздуха в различных районах городов России',
    tags: ['Экология', 'Метеорология'],
    status: 'active' as const,
    tasksCount: 15,
    participants: 234,
  },
  {
    id: '4',
    title: 'Наблюдение за звёздным небом',
    description: 'Фиксирование астрономических явлений, метеоров и светового загрязнения',
    tags: ['Астрономия'],
    status: 'active' as const,
    tasksCount: 6,
    participants: 67,
  },
  {
    id: '5',
    title: 'Мониторинг водоёмов',
    description: 'Исследование состояния рек и озёр: качество воды, флора и фауна',
    tags: ['Экология', 'Биология'],
    status: 'active' as const,
    tasksCount: 10,
    participants: 112,
  },
  {
    id: '6',
    title: 'Городская флора',
    description: 'Изучение растений городских парков и скверов, их видовой состав',
    tags: ['Биология', 'Экология'],
    status: 'active' as const,
    tasksCount: 7,
    participants: 78,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
                  Узнать больше →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Популярные проекты */}
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
              <Button variant="ghost">Все проекты →</Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {project.participants} участников
                      </span>
                      <span className="text-primary text-sm font-medium group-hover:underline">
                        Подробнее →
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-12 bg-[#f0fdf4]">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Готовы начать?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Зарегистрируйтесь и примите участие в исследованиях вместе с тысячами волонтёров
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Зарегистрироваться
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Смотреть проекты
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-foreground text-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold">
                Н
              </div>
              <span className="text-lg font-bold">Общее дело</span>
            </div>
            
            <div className="flex gap-6 text-sm text-white/60">
              <Link href="/projects" className="hover:text-white">Проекты</Link>
              <Link href="/about" className="hover:text-white">О платформе</Link>
              <Link href="/auth/login" className="hover:text-white">Вход</Link>
            </div>
            
            <div className="text-sm text-white/40">
              © 2024 Общее дело
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ variant, children }: { variant: 'success' | 'default' | 'outline', children: React.ReactNode }) {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700',
    default: 'bg-gray-100 text-gray-700',
    outline: 'border border-gray-300 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
