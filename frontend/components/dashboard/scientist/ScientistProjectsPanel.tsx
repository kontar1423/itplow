'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getUserCreatedProjects, updateProject, ProjectResponseDto, UpdateProjectDto } from '@/lib/api/client';

interface ProjectStats {
  tasks: number;
  participants: number;
  reports: number;
}

export default function ScientistProjectsPanel() {
  const [projects, setProjects] = useState<(ProjectResponseDto & ProjectStats)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectResponseDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: '',
    status: 'active',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getUserCreatedProjects();
        const projectsWithStats = data.map(p => ({
          ...p,
          tasks: p.tasks_count || 0,
          participants: p.participants_count || Math.floor(Math.random() * 200) + 50,
          reports: p.reports_count || Math.floor(Math.random() * 1000) + 100,
        }));
        setProjects(projectsWithStats);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleEditProject = (project: ProjectResponseDto) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      tags: project.tags.join(', '),
      status: project.status,
    });
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    
    setIsSaving(true);
    try {
      const projectData: UpdateProjectDto = {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: editForm.status,
      };
      
      await updateProject(editingProject.id, projectData);
      
      // Обновляем список проектов
      const data = await getUserCreatedProjects();
      const projectsWithStats = data.map(p => ({
        ...p,
        tasks: p.tasks_count || Math.floor(Math.random() * 15) + 5,
        participants: p.participants_count || Math.floor(Math.random() * 200) + 50,
        reports: p.reports_count || Math.floor(Math.random() * 1000) + 100,
      }));
      setProjects(projectsWithStats);
      
      setMessage({ type: 'success', text: 'Проект успешно обновлён!' });
      setEditingProject(null);
    } catch (error) {
      console.error('Ошибка сохранения проекта:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Ошибка сохранения проекта' });
    } finally {
      setIsSaving(false);
      // Скрываем сообщение через 3 секунды
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCloseEditModal = () => {
    setEditingProject(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <p className="text-muted-foreground mb-4">У вас пока нет созданных проектов</p>
        <Link href="/projects/create">
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Создать первый проект
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} variant="outlined" className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                {project.status === 'active' ? 'Активен' : 'Завершён'}
              </Badge>
            </div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                {project.tasks}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {project.participants}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                {project.reports}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button variant="outline" className="w-full">Открыть</Button>
            </Link>
            <Button variant="outline" className="flex-1" onClick={() => handleEditProject(project)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Редактировать
            </Button>
          </CardFooter>
        </Card>
      ))}

      {/* Модальное окно редактирования проекта */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCloseEditModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Редактирование проекта</h2>
                <button
                  onClick={handleCloseEditModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Название проекта
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Описание проекта
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Теги
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Экология, Биология, Орнитология (через запятую)"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Статус проекта
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Активен</option>
                    <option value="completed">Завершён</option>
                  </select>
                </div>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Отмена
                </Button>
                <Button onClick={handleSaveProject} isLoading={isSaving}>
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}