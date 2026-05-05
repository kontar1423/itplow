'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createObservation, CreateObservationDto, getMissionById, MissionResponseDto, uploadObservationFile } from '@/lib/api/client';
import { parseMissionRequirements } from '@/lib/missionRequirements';

const MAX_UPLOAD_FILE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;

async function compressImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_FILE_BYTES) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Не удалось обработать изображение'));
  });

  image.src = imageUrl;
  await loaded;
  URL.revokeObjectURL(imageUrl);

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.floor(image.width * scale));
  const targetHeight = Math.max(1, Math.floor(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return file;
  }
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  let quality = 0.85;
  let blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  while (blob && blob.size > MAX_UPLOAD_FILE_BYTES && quality > 0.45) {
    quality -= 0.1;
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  }

  if (!blob) {
    return file;
  }

  const outputName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
  return new File([blob], outputName, { type: 'image/jpeg' });
}

export default function TaskPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const taskId = params?.taskId as string;

  const [mission, setMission] = useState<MissionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    place: '',
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (photoFiles.length === 0) {
      setPhotoPreviewUrls([]);
      return;
    }

    const objectUrls = photoFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoFiles]);

  useEffect(() => {
    const loadMission = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await getMissionById(projectId, taskId);
        setMission(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки задания');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && taskId) {
      void loadMission();
    }
  }, [projectId, taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const requirementsMeta = parseMissionRequirements(mission?.requirements);

    if (requirementsMeta.requirePhoto && photoFiles.length === 0) {
      setError('Для этого задания необходимо прикрепить фото');
      setIsSubmitting(false);
      return;
    }

    const payload: CreateObservationDto = {
      title: formData.title,
      description: formData.description.trim(),
      place: formData.place.trim() || undefined,
    };

    try {
      const observation = await createObservation(projectId, taskId, payload);
      for (const photoFile of photoFiles) {
        const preparedFile = await compressImageForUpload(photoFile);
        if (preparedFile.size > MAX_UPLOAD_FILE_BYTES) {
          throw new Error(`Файл "${photoFile.name}" слишком большой. Уменьшите размер изображения.`);
        }
        await uploadObservationFile(projectId, taskId, observation.id, preparedFile, preparedFile.name);
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки наблюдения');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка...</div>;
  }

  if (!mission) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Задание не найдено</div>;
  }
  const requirementsMeta = parseMissionRequirements(mission.requirements);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-10 max-w-2xl">
          <Card variant="elevated" className="text-center py-10">
            <CardTitle className="text-2xl mb-2">Наблюдение отправлено</CardTitle>
            <CardDescription className="mb-6">Спасибо, ваш отчет ушел на проверку организатору проекта.</CardDescription>
            <div className="flex justify-center gap-3">
              <Link href={`/projects/${projectId}`}><Button variant="outline">К проекту</Button></Link>
              <Button onClick={() => {
                setIsSubmitted(false);
                setFormData({ title: '', description: '', place: '' });
                setPhotoFiles([]);
              }}>
                Отправить еще
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) {
      return;
    }
    setPhotoFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8 max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/projects" className="hover:text-primary">Проекты</Link>
          <span>/</span>
          <Link href={`/projects/${projectId}`} className="hover:text-primary">Проект</Link>
          <span>/</span>
          <span className="text-foreground">{mission.title}</span>
        </nav>

        <Card variant="outlined" className="mb-6">
          <CardHeader>
            <CardTitle>{mission.title}</CardTitle>
            <CardDescription>{mission.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {requirementsMeta.requirePhoto && <Badge variant="warning">Нужно фото</Badge>}
              {requirementsMeta.requirePlace && <Badge variant="warning">Нужно место</Badge>}
            </div>
            <Badge variant="secondary">Требования: {requirementsMeta.details || 'Не указаны'}</Badge>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Отправить наблюдение</CardTitle>
            <CardDescription>Заполните форму по результатам выполнения задания.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Название наблюдения</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-input"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Описание</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-input min-h-[140px]"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {requirementsMeta.requirePhoto && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Фото наблюдения</label>
                  <div className="space-y-3">
                    <label className="inline-flex items-center rounded-lg border border-primary text-primary px-4 py-2 cursor-pointer hover:bg-primary/5 transition-colors">
                      Добавить фото
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={handleFilesSelect}
                      />
                    </label>
                    {photoFiles.length > 0 && (
                      <p className="text-sm text-muted-foreground">Выбрано фото: {photoFiles.length}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Большие изображения автоматически сжимаются перед отправкой.</p>
                    {photoPreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photoPreviewUrls.map((photoUrl, index) => (
                          <div key={`${photoUrl}-${index}`} className="relative rounded-lg border border-border p-1">
                            <img
                              src={photoUrl}
                              alt={`Предпросмотр фото ${index + 1}`}
                              className="h-36 w-full rounded object-contain bg-muted/30"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 rounded-md bg-white/95 px-2 py-1 text-xs text-red-600 border border-red-200 hover:bg-red-50"
                              onClick={() => removePhoto(index)}
                            >
                              Удалить
                            </button>
                            <p className="mt-1 truncate text-xs text-muted-foreground px-1">{photoFiles[index]?.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Место наблюдения {requirementsMeta.requirePlace ? '' : '(необязательно)'}
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-input"
                  value={formData.place}
                  onChange={(e) => setFormData((prev) => ({ ...prev, place: e.target.value }))}
                  required={requirementsMeta.requirePlace}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Link href={`/projects/${projectId}`}><Button type="button" variant="outline">Отмена</Button></Link>
              <Button type="submit" isLoading={isSubmitting}>Отправить</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
