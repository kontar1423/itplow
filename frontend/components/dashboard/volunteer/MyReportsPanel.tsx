'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getMissions, getObservationFiles, getUserObservations, ObservationFileDto, UserObservationDto } from '@/lib/api/client';

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

async function loadObservationFilesWithFallback(report: UserObservationDto): Promise<ObservationFileDto[]> {
  try {
    return await getObservationFiles(report.projectId, report.missionId, report.id);
  } catch {
    const missions = await getMissions(report.projectId).catch(() => []);
    for (const mission of missions) {
      try {
        return await getObservationFiles(report.projectId, mission.id, report.id);
      } catch {
      }
    }
    return [];
  }
}

export default function MyReportsPanel() {
  const [reports, setReports] = useState<UserObservationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<UserObservationDto | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState<{ id: string; title: string; url: string }[]>([]);
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setError('');
        const data = await getUserObservations();
        setReports(data);
      } catch (loadError) {
        console.error('Ошибка загрузки отчётов:', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить отчёты');
      } finally {
        setIsLoading(false);
      }
    };

    void loadReports();
  }, []);

  const openReportDetails = async (report: UserObservationDto) => {
    try {
      setSelectedReport(report);
      setViewerOpen(true);
      setIsViewerLoading(true);
      setViewerPhotos([]);

      const files = await loadObservationFilesWithFallback(report);
      const photos = files
        .filter((file) => (file.file_type || file.type || '').startsWith('image/'))
        .map((file) => ({
          id: file.id,
          title: file.title || 'Фото',
          url: `/api/file-proxy?url=${encodeURIComponent(file.download_url || file.url)}`,
        }));

      setViewerPhotos(photos);
      setReports((prev) =>
        prev.map((item) =>
          item.id === report.id
            ? {
                ...item,
                files,
              }
            : item
        )
      );
    } catch (viewerError) {
      console.error('Ошибка загрузки файлов отчёта:', viewerError);
      setError(viewerError instanceof Error ? viewerError.message : 'Не удалось открыть отчёт');
      setViewerOpen(false);
    } finally {
      setIsViewerLoading(false);
    }
  };

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
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {reports.map((report) => {
        const status = formatStatus(report.status);
        const filesCount = report.files?.length ?? 0;

        return (
          <Card key={report.id} variant="outlined" className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {report.projectTitle} / {report.missionTitle}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {filesCount} фото
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {report.created_at ? new Date(report.created_at).toLocaleDateString('ru-RU') : '-'}
                </span>
                {report.place && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {report.place}
                  </span>
                )}
              </div>
              {report.description && (
                <p className="mt-2 text-sm text-muted-foreground">{report.description}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => void openReportDetails(report)}>
                Подробнее
              </Button>
            </CardFooter>
          </Card>
        );
      })}

      {viewerOpen && selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedReport.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedReport.projectTitle} / {selectedReport.missionTitle}
                </p>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setViewerOpen(false)}
              >
                Закрыть
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={formatStatus(selectedReport.status).variant}>{formatStatus(selectedReport.status).label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString('ru-RU') : '-'}
                </span>
              </div>

              {selectedReport.place && (
                <div>
                  <p className="mb-1 text-sm font-medium text-foreground">Место</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.place}</p>
                </div>
              )}

              {selectedReport.description && (
                <div>
                  <p className="mb-1 text-sm font-medium text-foreground">Описание</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Фотографии</p>

                {isViewerLoading && <p className="text-sm text-muted-foreground">Загрузка фото...</p>}

                {!isViewerLoading && viewerPhotos.length === 0 && (
                  <p className="text-sm text-muted-foreground">К этому отчёту фото не прикреплены.</p>
                )}

                {!isViewerLoading && viewerPhotos.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {viewerPhotos.map((photo) => (
                      <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="block">
                        <div className="rounded-lg border border-border p-2 transition-colors hover:border-primary/60">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="h-64 w-full rounded bg-muted/30 object-contain"
                          />
                          <p className="mt-2 truncate text-sm text-muted-foreground">{photo.title}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
