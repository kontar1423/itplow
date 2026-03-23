'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function MyReportsPage() {
  const [userRole, setUserRole] = useState<'scientist' | 'volunteer'>('volunteer');

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'volunteer' || savedRole === 'scientist') {
      setUserRole(savedRole);
    }
  }, []);

  const myReports = [
    {
      id: '1',
      projectName: 'Мониторинг птиц Москвы и Подмосковья',
      taskName: 'Подсчёт птиц в парке',
      status: 'approved' as const,
      submittedAt: '2024-03-01',
      approvedAt: '2024-03-02',
    },
    {
      id: '2',
      projectName: 'Качество воздуха в городах России',
      taskName: 'Измерение качества воздуха',
      status: 'pending' as const,
      submittedAt: '2024-03-03',
      approvedAt: null,
    },
    {
      id: '3',
      projectName: 'Мониторинг птиц Москвы и Подмосковья',
      taskName: 'Фотофиксация птиц',
      status: 'approved' as const,
      submittedAt: '2024-02-28',
      approvedAt: '2024-02-29',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Одобрен</Badge>;
      case 'pending':
        return <Badge variant="warning">На проверке</Badge>;
      case 'rejected':
        return <Badge variant="error">Отклонён</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Мои отчёты</h1>
          <p className="text-muted-foreground">
            История ваших отчётов по проектам
          </p>
        </div>

        {myReports.length === 0 ? (
          <Card variant="outlined" className="text-center py-12">
            <CardContent>
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                У вас пока нет отчётов
              </h3>
              <p className="text-muted-foreground mb-6">
                Примите участие в проектах и отправляйте свои отчёты
              </p>
              <Link href="/projects">
                <Button>Найти проекты</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myReports.map((report) => (
              <Card key={report.id} variant="outlined" className="hover:border-primary/30 transition-all">
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(report.status)}
                      </div>
                      <h3 className="font-medium text-foreground">{report.taskName}</h3>
                      <p className="text-sm text-muted-foreground">{report.projectName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="block text-xs">Отправлен</span>
                        <span className="font-medium">{new Date(report.submittedAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      {report.approvedAt && (
                        <div>
                          <span className="block text-xs">Одобрен</span>
                          <span className="font-medium">{new Date(report.approvedAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
