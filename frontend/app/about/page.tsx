'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Footer from '@/components/layout/Footer';
import CTA from '@/components/layout/CTA';
import { getCurrentUser, type UserResponseDto } from '@/lib/api/client';

export default function AboutPage() {
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null);
  
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
  
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-[#f0fdf4] py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              О платформе «Общее дело»
            </h1>
            <p className="text-lg text-muted-foreground">
              Узнайте больше о гражданской науке и возможностях участия в исследованиях
            </p>
          </div>
        </div>
      </div>

      {/* Что такое гражданская наука */}
      <div className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Что такое гражданская наука?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                <strong>Гражданская наука (Citizen Science)</strong> — это форма научных исследований, 
                в которой принимают участие добровольцы без специального научного образования. 
                Волонтёры помогают учёным собирать и обрабатывать данные, что позволяет 
                проводить исследования в масштабах, недоступных для небольших научных групп.
              </p>
              <p>
                С помощью платформы «Общее дело» каждый может внести свой вклад в науку: 
                от наблюдения за птицами в городском парке до мониторинга качества воздуха. 
                Это отличная возможность для тех, кто хочет узнать больше о природе, 
                научиться научному подходу и пообщаться с профессиональными учёными.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Как это работает */}
      <div className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
            Как это работает
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Зарегистрируйтесь',
                description: 'Создайте аккаунт на платформе. Выберите роль — волонтёр или учёный. Это бесплатно и займёт всего минуту.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
              },
              {
                step: '02',
                title: 'Найдите проект',
                description: 'Просмотрите каталог проектов в интересующей вас области: экология, биология, астрономия и другие.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
              },
              {
                step: '03',
                title: 'Присоединяйтесь',
                description: 'Станьте участником проекта и получите доступ к заданиям, которые нужно выполнить.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
              },
              {
                step: '04',
                title: 'Выполняйте задания',
                description: 'Следуйте инструкциям учёного, собирайте данные, делайте фотографии, записывайте наблюдения.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
              },
              {
                step: '05',
                title: 'Отправляйте отчёты',
                description: 'Заполните форму отчёта и отправьте результаты. Учёный проверит и одобрит вашу работу.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 15-9-9-9 9"/><path d="M22 15V9"/></svg>,
              },
              {
                step: '06',
                title: 'Следите за результатами',
                description: 'Просматривайте статистику проекта, читайте новости и узнавайте об открытиях.',
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-2 -left-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <Card variant="outlined" className="h-full">
                  <CardContent className="pt-8">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Роли */}
      <div className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
            Участники платформы
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card variant="elevated" className="text-center">
              <div className="mb-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Учёный / Организатор</CardTitle>
                <CardDescription>Исследователь, который создаёт и курирует проекты</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Создавайте исследовательские проекты
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Формулируйте задания для волонтёров
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Просматривайте и модерируйте отчёты
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Публикуйте результаты исследований
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Общайтесь с участниками проекта
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="/auth/register?role=scientist">
                  <Button>Стать организатором</Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card variant="elevated" className="text-center">
              <div className="mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Волонтёр</CardTitle>
                <CardDescription>Участник, который выполняет задания и собирает данные</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Участвуйте в научных проектах
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Выполняйте интересные задания
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Отправляйте наблюдения и отчёты
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Вносите вклад в науку
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    Узнавайте новое о природе
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="/auth/register?role=volunteer">
                  <Button variant="primary">Стать волонтёром</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Преимущества */}
      <div className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
            Почему это интересно?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg>,
                title: 'Реальный вклад в науку',
                description: 'Ваши наблюдения действительно используются учёными в исследованиях',
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
                title: 'Новые знания',
                description: 'Узнавайте больше о природе, науке и методах исследований',
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Сообщество',
                description: 'Общайтесь с единомышленниками и профессиональными учёными',
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
                title: 'Гибкость',
                description: 'Участвуйте в проектах в удобное время, когда вам удобно',
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
                title: 'На свежем воздухе',
                description: 'Многие задания предполагают работу на природе',
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                title: 'Доступность',
                description: 'Не нужно специального образования — всему научим',
              },
            ].map((item, index) => (
              <Card key={index} variant="outlined" className="text-center">
                <CardContent className="pt-6">
                  <div className='flex justify-center'>
                    <div className="text-4xl mb-3">{item.icon}</div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Категории проектов */}
      <div className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
            Направления проектов
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>, name: 'Орнитология', description: 'Наблюдение за птицами' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.2 0-7.5-3.6-7.5-8s3.3-8 7.5-8c.9 0 1.8.2 2.6.5"/><path d="M12 22c4.2 0 7.5-3.6 7.5-8s-3.3-8-7.5-8c-.9 0-1.8.2-2.6.5"/><path d="M12 22V2"/><path d="M20 8c2-2 3-4.5 3-8 0-1.5-.5-3-1.5-4"/><path d="M4 8c-2 2-3 4.5-3 8 0 1.5.5 3 1.5 4"/></svg>, name: 'Ботаника', description: 'Изучение растений' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.97 0-9-2.582-9-7v-.088C3 12.794 4.338 11.57 6.125 10.6c1.3-.7 2.7-1.1 4.2-1.2.9-.1 1.8-.1 2.7-.1s1.8 0 2.7.1c1.5.1 2.9.5 4.2 1.2 1.787.97 3.125 2.19 3.875 3.312V15c0 4.418-4.03 7-9 7Z"/><path d="M9 21c1.5 1 3.5 2 6 2s4.5-1 6-2"/><path d="M12 17v4"/><path d="M8 10c0-1.1.9-2 2-2s2 .9 2 2"/><path d="M12 10c0-1.1.9-2 2-2s2 .9 2 2"/></svg>, name: 'Гидрология', description: 'Исследование водоёмов' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-1.7-1.3-3-3-3h-5c-1.7 0-3 1.3-3 3"/><path d="M7 16.5v-13c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v7"/><path d="M15.5 5c1.1 0 2 .9 2 2v1.5"/><path d="M12 11v4"/></svg>, name: 'Метеорология', description: 'Наблюдение за погодой' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.2 0-7.5-3.6-7.5-8s3.3-8 7.5-8c.9 0 1.8.2 2.6.5"/><path d="M12 22c4.2 0 7.5-3.6 7.5-8s-3.3-8-7.5-8c-.9 0-1.8.2-2.6.5"/><circle cx="12" cy="14" r="2"/><circle cx="12" cy="14" r="6"/><path d="M12 2v4"/><path d="M12 22v-4"/></svg>, name: 'Астрономия', description: 'Наблюдение за небом' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16"/><path d="M17 4v16"/><path d="M21 8H3"/><path d="M21 16H3"/><path d="M12 5C7 5 3 8 3 13c0 3 2 5.5 5 7 1 .5 2 1 3 1h6c1 0 2-.5 3-1 3-1.5 5-4 5-7 0-5-4-8-9-8Z"/><circle cx="12" cy="13" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/></svg>, name: 'Энтомология', description: 'Изучение насекомых' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>, name: 'Экология', description: 'Охрана окружающей среды' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 9-9 9 9"/><path d="M12 3v18"/><path d="M12 8h8"/><path d="M12 16h8"/><path d="M8 21V10"/><path d="M16 21V10"/></svg>, name: 'Археология', description: 'Поиск исторических объектов' },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>, name: 'Фотографии', description: 'Визуальная документация' },
            ].map((item, index) => (
              <Card key={index} variant="outlined">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="text-3xl flex items-center justify-center w-10 h-10">{item.icon}</div>
                  <div>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
            Частые вопросы
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Нужно ли специальное образование?',
                a: 'Нет, специальное образование не требуется. Все необходимые инструкции и обучение предоставляются в рамках проекта. Главное — это интерес и желание учиться!',
              },
              {
                q: 'Сколько времени занимает участие?',
                a: 'Вы сами выбираете, сколько времени посвящать проекту. Можно уделять этому 30 минут в неделю или несколько часов — зависит от вашего желания и количества заданий.',
              },
              {
                q: 'Что я получу от участия?',
                a: 'Вы получите новые знания, опыт научной работы, возможность внести вклад в реальные исследования, общение с единомышленниками и, возможно, новых друзей.',
              },
              {
                q: 'Как учёные используют мои данные?',
                a: 'Все собранные данные обрабатываются и анализируются учёными. Результаты могут быть опубликованы в научных статьях, отчётах и представлены на конференциях.',
              },
              {
                q: 'Могу ли я создать свой проект?',
                a: 'Да, после регистрации в роли учёного вы можете создавать собственные проекты и приглашать волонтёров к участию.',
              },
            ].map((item, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-muted rounded-lg list-none">
                  <span className="font-medium text-foreground">{item.q}</span>
                  <span className="text-primary transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* CTA - only show if user is not logged in */}
      <CTA isVisible={!currentUser} />

      <Footer />
    </div>
  );
}
