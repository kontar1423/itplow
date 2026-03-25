'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getUserObservations, UserObservationDto } from '@/lib/api/client';

export default function MyReportsPanel() {
  const [reports, setReports] = useState<UserObservationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getUserObservations();
        setReports(data);
      } catch (error) {
        console.error('Ошибка загрузки отчётов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <p className="text-muted-foreground">У вас пока нет отчётов</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} variant="outlined" className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {report.projectTitle} / {report.missionTitle}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {report.status === 'pending' && (
                  <Badge variant="warning">На проверке</Badge>
                )}
                {report.status === 'approved' && (
                  <Badge variant="success">Принято</Badge>
                )}
                {report.status === 'rejected' && (
                  <Badge variant="error">Отклонено</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {report.files.length} фото
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {report.created_at ? new Date(report.created_at).toLocaleDateString('ru-RU') : '-'}
              </span>
            </div>
            {report.description && (
              <p className="mt-2 text-sm text-muted-foreground">{report.description}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">
              Подробнее
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}