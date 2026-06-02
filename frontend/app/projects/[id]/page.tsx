'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import {
  getCurrentUser,
  getMissions,
  getParticipations,
  getProjectById,
  getUserById,
  joinProject,
  MissionResponseDto,
  ProjectResponseDto,
  updateMission,
  updateProject,
  UserResponseDto,
} from '@/lib/api/client';
import { buildMissionRequirements, parseMissionRequirements } from '@/lib/missionRequirements';

function canManageProject(user: UserResponseDto | null, project: ProjectResponseDto | null): boolean {
  if (!user || !project) {
    return false;
  }
  return user.id === project.user_id || user.role === 'admin';
}

function missionStatusLabel(status: string): string {
  if (status === 'active') {
    return 'Активно';
  }
  if (status === 'completed') {
    return 'Завершено';
  }
  if (status === 'inactive') {
    return 'Неактивно';
  }
  return status;
}

function formatCount(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;

  if (abs > 10 && abs < 20) {
    return `${count} ${many}`;
  }
  if (last === 1) {
    return `${count} ${one}`;
  }
  if (last >= 2 && last <= 4) {
    return `${count} ${few}`;
  }
  return `${count} ${many}`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectResponseDto | null>(null);
  const [missions, setMissions] = useState<MissionResponseDto[]>([]);
  const [owner, setOwner] = useState<UserResponseDto | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isJoinedByCurrentUser, setIsJoinedByCurrentUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', tags: '', status: 'active' });

  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [missionForm, setMissionForm] = useState({
    title: '',
    description: '',
    requirements: '',
    status: 'active',
    requirePhoto: false,
    requirePlace: false,
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const [projectData, missionsData] = await Promise.all([
        getProjectById(projectId),
        getMissions(projectId),
      ]);

      setProject(projectData);
      setMissions(missionsData);
      setProjectForm({
        title: projectData.title,
        description: projectData.description,
        tags: projectData.tags.join(', '),
        status: projectData.status,
      });

      const [ownerData, participations] = await Promise.all([
        getUserById(projectData.user_id).catch(() => null),
        getParticipations(projectId).catch(() => []),
      ]);

      setOwner(ownerData);
      setParticipantsCount(participations.length);

      try {
        const me = await getCurrentUser();
        setCurrentUser(me);
        const joinedFromList = participations.some((participant) => participant.user_id === me.id);
        const joinedFromProfile = me.participations?.some((participant) => participant.project_id === projectData.id) === true;
        setIsJoinedByCurrentUser(joinedFromList || joinedFromProfile);
      } catch {
        setCurrentUser(null);
        setIsJoinedByCurrentUser(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проекта');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      void loadData();
    }
  }, [projectId, loadData]);

  const isManager = canManageProject(currentUser, project);
  const isParticipant =
    !!project &&
    !!currentUser &&
    (project.user_id === currentUser.id || isJoinedByCurrentUser);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await joinProject(projectId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось присоединиться к проекту');
    } finally {
      setIsJoining(false);
    }
  };

  const saveProject = async () => {
    if (!project) {
      return;
    }

    try {
      await updateProject(project.id, {
        title: projectForm.title,
        description: projectForm.description,
        status: projectForm.status,
        tags: projectForm.tags.split(',').map((v) => v.trim()).filter(Boolean),
      });
      setIsEditingProject(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить проект');
    }
  };

  const startMissionEdit = (mission: MissionResponseDto) => {
    const parsed = parseMissionRequirements(mission.requirements);
    setEditingMissionId(mission.id);
    setMissionForm({
      title: mission.title,
      description: mission.description,
      requirements: parsed.details,
      status: mission.status,
      requirePhoto: parsed.requirePhoto,
      requirePlace: parsed.requirePlace,
    });
  };

  const saveMission = async () => {
    if (!editingMissionId) {
      return;
    }

    try {
      await updateMission(projectId, editingMissionId, {
        title: missionForm.title,
        description: missionForm.description,
        requirements: buildMissionRequirements(missionForm.requirements, missionForm.requirePhoto, missionForm.requirePlace),
        status: missionForm.status,
      });
      setEditingMissionId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить задание');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка...</div>;
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Проект не найден</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#f0fdf4] py-12">
        <div className="container-custom max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/projects" className="hover:text-primary">Проекты</Link>
            <span>/</span>
            <span className="text-foreground">{project.title}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                  {project.status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
                {isManager && <Badge variant="primary">Ваш проект</Badge>}
                {!isManager && isParticipant && <Badge variant="primary">Вы участвуете</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{project.title}</h1>
              <p className="text-muted-foreground text-lg">{project.description}</p>
              {!isManager && isParticipant && (
                <p className="text-sm text-primary mt-2">Вы участвуете в проекте.</p>
              )}
            </div>

            <div className="flex gap-3">
              {!isParticipant && !isManager && (
                currentUser ? (
                  <Button onClick={handleJoin} isLoading={isJoining}>Присоединиться</Button>
                ) : (
                  <Link href="/auth/login"><Button>Войти и присоединиться</Button></Link>
                )
              )}
              {isManager && (
                <Button variant="outline" onClick={() => setIsEditingProject((v) => !v)}>
                  {isEditingProject ? 'Отмена' : 'Редактировать проект'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="py-10">
        <div className="container-custom max-w-4xl space-y-6">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          {isEditingProject && isManager && (
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Редактирование проекта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-input"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-input min-h-[120px]"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <input
                  className="w-full px-4 py-3 rounded-lg border border-input"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="экология, мониторинг"
                />
                <select
                  className="w-full px-4 py-3 rounded-lg border border-input"
                  value={projectForm.status}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="completed">Завершен</option>
                </select>
                <div className="flex justify-end">
                  <Button onClick={saveProject}>Сохранить проект</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card variant="outlined">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Задания проекта</CardTitle>
                  <CardDescription>
                    {formatCount(missions.length, 'задание', 'задания', 'заданий')} • {formatCount(participantsCount, 'участник', 'участника', 'участников')}
                  </CardDescription>
                </div>
                {isManager && (
                  <Link href={`/projects/${project.id}/tasks/create`}>
                    <Button variant="outline">Создать задание</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {missions.length === 0 && <p className="text-muted-foreground">Задания пока не добавлены.</p>}

              <div className="space-y-4">
                {missions.map((mission) => {
                  const parsed = parseMissionRequirements(mission.requirements);
                  return (
                  <div key={mission.id} className="p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{mission.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                      </div>
                      <Badge variant={mission.status === 'active' ? 'success' : 'default'}>{missionStatusLabel(mission.status)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {parsed.requirePhoto && <Badge variant="warning">Нужно фото</Badge>}
                      {parsed.requirePlace && <Badge variant="warning">Нужно место</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">Требования: {parsed.details || 'Не указаны'}</p>

                    {editingMissionId === mission.id ? (
                      <div className="space-y-3 pt-2">
                        <input
                          className="w-full px-4 py-3 rounded-lg border border-input"
                          value={missionForm.title}
                          onChange={(e) => setMissionForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                        <textarea
                          className="w-full px-4 py-3 rounded-lg border border-input min-h-[100px]"
                          value={missionForm.description}
                          onChange={(e) => setMissionForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                        <textarea
                          className="w-full px-4 py-3 rounded-lg border border-input min-h-[80px]"
                          value={missionForm.requirements}
                          onChange={(e) => setMissionForm((prev) => ({ ...prev, requirements: e.target.value }))}
                        />
                        <Checkbox
                          label="Требуется фото"
                          checked={missionForm.requirePhoto}
                          onChange={(e) => setMissionForm((prev) => ({ ...prev, requirePhoto: e.target.checked }))}
                        />
                        <Checkbox
                          label="Требуется место"
                          checked={missionForm.requirePlace}
                          onChange={(e) => setMissionForm((prev) => ({ ...prev, requirePlace: e.target.checked }))}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditingMissionId(null)}>Отмена</Button>
                          <Button onClick={saveMission}>Сохранить задание</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        {isParticipant && !isManager && (
                          <Link href={`/projects/${project.id}/tasks/${mission.id}`}>
                            <Button variant="outline" size="sm">Отправить отчет</Button>
                          </Link>
                        )}
                        {isManager && (
                          <Button variant="outline" size="sm" onClick={() => startMissionEdit(mission)}>
                            Редактировать
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Организатор</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>{owner ? `${owner.first_name} ${owner.last_name}`.trim() : 'Пользователь'}</p>
              {owner?.description && <p>{owner.description}</p>}
              {owner?.email && <p>{owner.email}</p>}
              {owner?.phone && <p>{owner.phone}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
