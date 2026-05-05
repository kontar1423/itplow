const API_BASE_URL = 'http://localhost:8080/api';

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

function getHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || error.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'scientist' | 'volunteer';
  description?: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  description?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'user' | 'admin';
  description: string;
  participations?: ParticipationResponseDto[];
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: UserResponseDto }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function registerUser(data: CreateUserDto): Promise<{ token: string; user: UserResponseDto }> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getCurrentUser(): Promise<UserResponseDto> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function updateCurrentUser(data: UpdateUserDto): Promise<UserResponseDto> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function getUserById(id: string): Promise<UserResponseDto> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export interface CreateProjectDto {
  title: string;
  description: string;
  status: string;
  tags?: string[];
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: string;
  tags?: string[];
}

export interface ProjectResponseDto {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  tasks_count?: number;
  participants_count?: number;
  reports_count?: number;
}

export async function getProjects(): Promise<ProjectResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getProjectById(id: string): Promise<ProjectResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getProjectsByTags(tags: string[]): Promise<ProjectResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/projects/by_tags`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ tags }),
  });
  return handleResponse(response);
}

export async function createProject(data: CreateProjectDto): Promise<ProjectResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateProject(id: string, data: UpdateProjectDto): Promise<ProjectResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

export interface CreateMissionDto {
  title: string;
  description: string;
  requirements: string;
  status: string;
}

export interface UpdateMissionDto {
  title?: string;
  description?: string;
  requirements?: string;
  status?: string;
}

export interface MissionResponseDto {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requirements: string;
  status: string;
}

export async function getMissions(projectId: string): Promise<MissionResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getMissionById(projectId: string, missionId: string): Promise<MissionResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createMission(projectId: string, data: CreateMissionDto): Promise<MissionResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateMission(projectId: string, missionId: string, data: UpdateMissionDto): Promise<MissionResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteMission(projectId: string, missionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

export interface CreateObservationDto {
  title: string;
  description?: string;
  place?: string;
}

function getAuthHeadersWithoutContentType(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface UpdateObservationDto {
  title?: string;
  description?: string;
  place?: string;
  status?: string;
}

export interface ObservationFileDto {
  id: string;
  title: string;
  type?: string;
  file_type?: string;
  url: string;
  download_url?: string;
}

export interface ObservationCommentResponseDto {
  id: string;
  observation_id: string;
  user_id: string;
  parent_comment_id: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ObservationResponseDto {
  id: string;
  user_id: string;
  mission_id: string;
  title: string;
  description: string;
  place?: string;
  status: string;
  files: ObservationFileDto[];
  comments?: ObservationCommentResponseDto[];
  created_at: string;
}

export async function getObservations(projectId: string, missionId: string): Promise<ObservationResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getObservationById(projectId: string, missionId: string, obsId: string): Promise<ObservationResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createObservation(projectId: string, missionId: string, data: CreateObservationDto): Promise<ObservationResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateObservation(projectId: string, missionId: string, obsId: string, data: UpdateObservationDto): Promise<ObservationResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteObservation(projectId: string, missionId: string, obsId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

export interface CreateObservationCommentDto {
  comment: string;
  parent_comment_id?: string | null;
}

export interface UpdateObservationCommentDto {
  comment?: string;
}

export async function getObservationComments(projectId: string, missionId: string, obsId: string): Promise<ObservationCommentResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}/comments`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function createObservationComment(projectId: string, missionId: string, obsId: string, data: CreateObservationCommentDto): Promise<ObservationCommentResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateObservationComment(projectId: string, missionId: string, obsId: string, commentId: string, data: UpdateObservationCommentDto): Promise<ObservationCommentResponseDto> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteObservationComment(projectId: string, missionId: string, obsId: string, commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

export interface ParticipationResponseDto {
  id: string;
  user_id: string;
  project_id: string;
  user_name?: string;
}

export async function getParticipations(projectId: string): Promise<ParticipationResponseDto[]> {
  const response = await fetch(`${API_BASE_URL}/participations/${projectId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function joinProject(projectId: string): Promise<ParticipationResponseDto> {
  const response = await fetch(`${API_BASE_URL}/participations/${projectId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function leaveProject(projectId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/participations/${projectId}/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

export async function getUserProjects(): Promise<ProjectResponseDto[]> {
  // Получаем текущего пользователя с его участиями
  const user = await getCurrentUser();

  // Если нет участий, возвращаем пустой массив
  if (!user.participations || user.participations.length === 0) {
    return [];
  }

  // Получаем все проекты
  const allProjects = await getProjects();

  // Фильтруем проекты, в которых участвует пользователь
  const userProjectIds = user.participations.map(p => p.project_id);
  return allProjects.filter(project => userProjectIds.includes(project.id));
}

export async function getUserCreatedProjects(): Promise<ProjectResponseDto[]> {
  // Получаем текущего пользователя
  const user = await getCurrentUser();
  
  // Получаем проекты, созданные этим пользователем
  const response = await fetch(`${API_BASE_URL}/users/${user.id}/projects`, {
    method: 'GET',
    headers: getHeaders(),
  });
  const projects = await handleResponse<ProjectResponseDto[]>(response);
  
  // Для каждого проекта получаем количество миссий
  const projectsWithMissions = await Promise.all(
    projects.map(async (project) => {
      try {
        const missions = await getMissions(project.id);
        return {
          ...project,
          tasks_count: missions.length,
        };
      } catch {
        return project;
      }
    })
  );
  
  return projectsWithMissions;
}

export interface UserObservationDto {
  id: string;
  projectId: string;
  projectTitle: string;
  missionId: string;
  missionTitle: string;
  title: string;
  description: string;
  place?: string;
  status: string;
  files: ObservationFileDto[];
  created_at: string;
}

export async function getObservationFiles(projectId: string, missionId: string, obsId: string): Promise<ObservationFileDto[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}/files`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function uploadObservationFile(
  projectId: string,
  missionId: string,
  obsId: string,
  file: File,
  title?: string
): Promise<ObservationFileDto> {
  const formData = new FormData();
  formData.append('file', file);
  if (title?.trim()) {
    formData.append('title', title.trim());
  }

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/missions/${missionId}/observations/${obsId}/files`, {
    method: 'POST',
    headers: getAuthHeadersWithoutContentType(),
    body: formData,
  });

  return handleResponse(response);
}

export async function getUserObservations(): Promise<UserObservationDto[]> {
  const user = await getCurrentUser();
  const allProjects = await getProjects();
  const userObservations: UserObservationDto[] = [];
  
  // Для каждого проекта получаем миссии и наблюдения
  for (const project of allProjects) {
    try {
      const missions = await getMissions(project.id);
      for (const mission of missions) {
        try {
          const observations = await getObservations(project.id, mission.id);
          // Фильтруем наблюдения текущего пользователя
          const userMissionObs = observations.filter(obs => obs.user_id === user.id);
          for (const obs of userMissionObs) {
            userObservations.push({
              id: obs.id,
              projectId: project.id,
              projectTitle: project.title,
              missionId: mission.id,
              missionTitle: mission.title,
              title: obs.title,
              description: obs.description,
              place: obs.place,
              status: obs.status,
              files: obs.files,
              created_at: obs.created_at,
            });
          }
        } catch {
          // Если не удалось получить наблюдения для миссии, пропускаем
          continue;
        }
      }
    } catch {
      // Если не удалось получить миссии для проекта, пропускаем
      continue;
    }
  }
  
  // Сортируем по дате создания (новые first)
  return userObservations.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
