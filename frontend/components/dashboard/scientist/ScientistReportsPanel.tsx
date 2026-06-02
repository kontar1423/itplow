'use client';

import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  getCurrentUser,
  getMissions,
  getObservationFiles,
  getObservations,
  getUserCreatedProjects,
  getUserById,
  ObservationResponseDto,
  updateObservation,
} from '@/lib/api/client';

interface ScientistReport {
  id: string;
  projectId: string;
  projectName: string;
  missionId: string;
  missionName: string;
  volunteerId: string;
  volunteerName: string;
  title: string;
  description: string;
  place: string;
  date: string;
  status: string;
  photosCount: number;
}

function formatStatus(status: string): { label: string; variant: 'warning' | 'success' | 'error' | 'default' } {
  if (status === 'pending') {
    return { label: 'На проверке', variant: 'warning' };
  }
  if (status === 'approved') {
    return { label: 'Принято', variant: 'success' };
  }
  if (status === 'rejected') {
    return { label: 'Отклонено', variant: 'error' };
  }
  return { label: status, variant: 'default' };
}

export default function ScientistReportsPanel() {
  const [reports, setReports] = useState<ScientistReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerPhotos, setViewerPhotos] = useState<{ id: string; title: string; url: string }[]>([]);
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        setError('');

        const currentUser = await getCurrentUser();
        const projects = await getUserCreatedProjects();
        const allReports: ScientistReport[] = [];

        const authorNameCache = new Map<string, string>();
        authorNameCache.set(currentUser.id, `${currentUser.first_name} ${currentUser.last_name}`.trim() || 'Вы');

        for (const project of projects) {
          const missions = await getMissions(project.id).catch(() => []);

          for (const mission of missions) {
            const observations = await getObservations(project.id, mission.id).catch(() => []);

            for (const obs of observations) {
              const observation = obs as ObservationResponseDto;
              if (!authorNameCache.has(observation.user_id)) {
                const volunteer = await getUserById(observation.user_id).catch(() => null);
                authorNameCache.set(
                  observation.user_id,
                  volunteer ? `${volunteer.first_name} ${volunteer.last_name}`.trim() || 'Пользователь' : 'Пользователь'
                );
              }

              allReports.push({
                id: observation.id,
                projectId: project.id,
                projectName: project.title,
                missionId: observation.mission_id || mission.id,
                missionName: mission.title,
                volunteerId: observation.user_id,
                volunteerName: authorNameCache.get(observation.user_id) || 'Пользователь',
                title: observation.title,
                description: observation.description || '',
                place: observation.place || '',
                date: observation.created_at,
                status: observation.status,
                photosCount: observation.files?.length || 0,
              });
            }
          }
        }

        const reportsWithFilesCount = await Promise.all(
          allReports.map(async (report) => {
            try {
              const files = await loadObservationFilesWithFallback(report);
              const photosCount = files.filter((file) => (file.file_type || file.type || '').startsWith('image/')).length;
              return { ...report, photosCount };
            } catch {
              return report;
            }
          })
        );

        reportsWithFilesCount.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReports(reportsWithFilesCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки отчётов');
      } finally {
        setIsLoading(false);
      }
    };

    void loadReports();
  }, []);

  const stats = useMemo(() => ({
    pending: reports.filter((r) => r.status === 'pending').length,
    approved: reports.filter((r) => r.status === 'approved').length,
    rejected: reports.filter((r) => r.status === 'rejected').length,
  }), [reports]);

  const updateReportStatus = async (report: ScientistReport, newStatus: 'approved' | 'rejected') => {
    try {
      setUpdatingId(report.id);
      try {
        await updateObservation(report.projectId, report.missionId, report.id, { status: newStatus });
      } catch (primaryError) {
        const missions = await getMissions(report.projectId).catch(() => []);
        let updated = false;

        for (const mission of missions) {
          try {
            await updateObservation(report.projectId, mission.id, report.id, { status: newStatus });
            updated = true;
            break;
          } catch {
          }
        }

        if (!updated) {
          throw primaryError;
        }
      }
      setReports((prev) => prev.map((item) => (item.id === report.id ? { ...item, status: newStatus } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус отчёта');
    } finally {
      setUpdatingId('');
    }
  };

  const openPhotosViewer = async (report: ScientistReport) => {
    try {
      setViewerOpen(true);
      setViewerTitle(report.title);
      setIsViewerLoading(true);
      setViewerPhotos([]);

      const files = await loadObservationFilesWithFallback(report);
      const photos = files
        .filter((file) => (file.file_type || file.type || '').startsWith('image/'))
        .map((file) => ({
          id: file.id,
          title: file.title || 'Фото',
          url: `/api/file-proxy?url=${encodeURIComponent(file.download_url || file.url)}`,
        }))
        .filter((file) => Boolean(file.url));

      setViewerPhotos(photos);
      setReports((prev) => prev.map((item) => (item.id === report.id ? { ...item, photosCount: photos.length } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить фото отчёта');
      setViewerOpen(false);
    } finally {
      setIsViewerLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Загрузка отчётов...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Все отчёты</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>На проверке: {stats.pending}</span>
          <span>|</span>
          <span>Принято: {stats.approved}</span>
          <span>|</span>
          <span>Отклонено: {stats.rejected}</span>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {reports.length === 0 && (
        <Card variant="outlined" className="text-center py-12">
          <p className="text-muted-foreground">Пока нет отчётов от волонтёров</p>
        </Card>
      )}

      <div className="space-y-3">
        {reports.map((report) => {
          const status = formatStatus(report.status);

          return (
            <Card key={report.id} variant="outlined" className={`hover:shadow-md transition-shadow ${report.status === 'pending' ? 'border-primary/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {report.projectName} • {report.missionName} • {report.volunteerName}
                    </CardDescription>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-3 space-y-2">
                <p className="text-sm text-muted-foreground">{report.description || 'Описание не указано'}</p>
                {report.place && <p className="text-sm text-muted-foreground">Место: {report.place}</p>}
                <p className="text-sm text-muted-foreground">Дата: {new Date(report.date).toLocaleDateString('ru-RU')}</p>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPhotosViewer(report)}
                >
                  Фото ({report.photosCount})
                </Button>
                <Button
                  variant={report.status === 'approved' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => updateReportStatus(report, 'approved')}
                  disabled={updatingId === report.id || report.status === 'approved'}
                >
                  Принять
                </Button>
                <Button
                  variant={report.status === 'rejected' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => updateReportStatus(report, 'rejected')}
                  disabled={updatingId === report.id || report.status === 'rejected'}
                >
                  Отклонить
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Фото отчёта: {viewerTitle}</h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setViewerOpen(false)}
              >
                Закрыть
              </button>
            </div>

            <div className="p-5">
              {isViewerLoading && <p className="text-muted-foreground">Загрузка фото...</p>}

              {!isViewerLoading && viewerPhotos.length === 0 && (
                <p className="text-muted-foreground">К этому отчёту фото не прикреплены.</p>
              )}

              {!isViewerLoading && viewerPhotos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewerPhotos.map((photo) => (
                    <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="block">
                      <div className="rounded-lg border border-border p-2 hover:border-primary/60 transition-colors">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="h-64 w-full rounded object-contain bg-muted/30"
                        />
                        <p className="mt-2 text-sm text-muted-foreground truncate">{photo.title}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  const loadObservationFilesWithFallback = async (report: ScientistReport) => {
    try {
      return await getObservationFiles(report.projectId, report.missionId, report.id);
    } catch {
      const missions = await getMissions(report.projectId).catch(() => []);
      for (const mission of missions) {
        try {
          const files = await getObservationFiles(report.projectId, mission.id, report.id);
          return files;
        } catch {
        }
      }
      return [];
    }
  };
