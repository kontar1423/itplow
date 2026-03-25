'use client';

import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Report {
  id: string;
  projectName: string;
  taskName: string;
  volunteer: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  isNew: boolean;
}

export default function ScientistReportsPanel() {
  const [reports, setReports] = useState<Report[]>([
    { id: '1', projectName: 'Мониторинг птиц Москвы', taskName: 'Подсчёт птиц в парке', volunteer: 'Анна Смирнова', date: '2024-02-15', status: 'pending', isNew: true },
    { id: '2', projectName: 'Фенологические наблюдения', taskName: 'Фенология растений', volunteer: 'Михаил Козлов', date: '2024-02-14', status: 'approved', isNew: false },
    { id: '3', projectName: 'Качество воздуха', taskName: 'Измерение PM2.5', volunteer: 'Елена Иванова', date: '2024-02-14', status: 'pending', isNew: true },
    { id: '4', projectName: 'Мониторинг птиц Москвы', taskName: 'Наблюдение за гнездом', volunteer: 'Дмитрий Петров', date: '2024-02-13', status: 'rejected', isNew: false },
    { id: '5', projectName: 'Фенологические наблюдения', taskName: 'Цветение одуванчиков', volunteer: 'Ольга Сидорова', date: '2024-02-12', status: 'approved', isNew: false },
    { id: '6', projectName: 'Качество воздуха', taskName: 'Измерение NO2', volunteer: 'Сергей Николаев', date: '2024-02-11', status: 'pending', isNew: true },
  ]);

  const updateReportStatus = (reportId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus, isNew: false }
        : report
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Все отчёты</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>На проверке: {reports.filter(r => r.status === 'pending').length}</span>
          <span>|</span>
          <span>Принято: {reports.filter(r => r.status === 'approved').length}</span>
          <span>|</span>
          <span>Отклонено: {reports.filter(r => r.status === 'rejected').length}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} variant="outlined" className={`hover:shadow-md transition-shadow ${report.isNew ? 'border-primary/50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{report.taskName}</CardTitle>
                    {report.isNew && (
                      <Badge variant="primary">Новое</Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {report.projectName} • {report.volunteer}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {report.date}
                </span>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button 
                variant={report.status === 'approved' ? 'secondary' : 'outline'} 
                size="sm"
                onClick={() => updateReportStatus(report.id, 'approved')}
                disabled={report.status === 'approved'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
                Принять
              </Button>
              <Button 
                variant={report.status === 'rejected' ? 'danger' : 'outline'} 
                size="sm"
                onClick={() => updateReportStatus(report.id, 'rejected')}
                disabled={report.status === 'rejected'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Отклонить
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}