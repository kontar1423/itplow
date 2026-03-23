# API endpoints documentation

## Пользователи (`/api/users`)

- `GET /api/users` — список пользователей.
- `GET /api/users/me` — профиль текущего пользователя по access token. Возвращает также его `participations`.
- `GET /api/users/:id` — профиль пользователя по `id`.
- `GET /api/users/:id/projects` — проекты конкретного пользователя.
- `POST /api/users` — создание пользователя. Если роль не передана, используется `user`.
- `PUT|PATCH /api/users/me` — частичное или полное обновление своего профиля без изменения `email`.
- `PUT|PATCH /api/users/:id` — обновление пользователя по `id` только для `admin`.
- `DELETE /api/users/:id` — удаление пользователя только для `admin`.

```typescript
export class CreateUserDto {
  email: string;
  password: string; // >= 6 символов
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'user' | 'admin';
  description?: string;
}

export class UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  description?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'user' | 'admin';
  description: string;
  participations?: ParticipationResponseDto[];
}
```

## Проекты (`/api/projects`)

- `GET /api/projects` — список проектов.
- `GET /api/projects/:id` — проект по `id`.
- `GET /api/projects/by_tags` — проекты по набору тегов. Ожидает массив `tags`.
- `POST /api/projects` — создание проекта.
- `PUT|PATCH /api/projects/:id` — частичное или полное обновление проекта. Требуется токен владельца проекта или `admin`.
- `DELETE /api/projects/:id` — удаление проекта. Требуется токен владельца проекта или `admin`.

```typescript
export class CreateProjectDto {
  title: string;
  description: string;
  status: string;
  tags?: string[];
}

export class UpdateProjectDto {
  title?: string;
  description?: string;
  status?: string;
  tags?: string[];
}

export class ProjectResponseDto {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
}
```

### Missions (`/api/projects/:project_id/missions`)

- `GET /api/projects/:project_id/missions` — список миссий проекта.
- `GET /api/projects/:project_id/missions/:mission_id` — одна миссия проекта.
- `POST /api/projects/:project_id/missions` — создание миссии.
- `PUT|PATCH /api/projects/:project_id/missions/:mission_id` — частичное или полное обновление миссии. Требуется токен владельца проекта или `admin`.
- `DELETE /api/projects/:project_id/missions/:mission_id` — удаление миссии. Требуется токен владельца проекта или `admin`.

```typescript
export class CreateMissionDto {
  title: string;
  description: string;
  requirements: string;
  status: string;
}

export class UpdateMissionDto {
  title?: string;
  description?: string;
  requirements?: string;
  status?: string;
}

export class MissionResponseDto {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requirements: string;
  status: string;
}
```

### Observations (`/api/projects/:project_id/missions/:mission_id/observations`)

- `GET /api/projects/:project_id/missions/:mission_id/observations` — список наблюдений миссии.
- `GET /api/projects/:project_id/missions/:mission_id/observations/:obs_id` — одно наблюдение.
- `POST /api/projects/:project_id/missions/:mission_id/observations` — создание наблюдения.
- `PUT|PATCH /api/projects/:project_id/missions/:mission_id/observations/:obs_id` — частичное или полное обновление наблюдения. Требуется токен автора observation, владельца проекта или `admin`.
- `DELETE /api/projects/:project_id/missions/:mission_id/observations/:obs_id` — удаление наблюдения. Требуется токен автора observation, владельца проекта или `admin`.

```typescript
export class CreateObservationDto {
  title: string;
  description: string;
}

export class UpdateObservationDto {
  title?: string;
  description?: string;
  status?: string;
}

export class ObservationFileDto {
  id: string;
  title: string;
  type: string;
  url: string;
}

export class ObservationCommentResponseDto {
  id: string;
  observation_id: string;
  user_id: string;
  parent_comment_id: string | null; // null для корневого комментария
  comment: string;
  created_at: string;
  updated_at: string;
}

export class ObservationResponseDto {
  id: string;
  user_id: string;
  mission_id: string;
  title: string;
  description: string;
  status: string;
  files: ObservationFileDto[];
  comments?: ObservationCommentResponseDto[];
}
```

### Observation Comments (`/api/projects/:project_id/missions/:mission_id/observations/:obs_id/comments`)

- `GET /api/projects/:project_id/missions/:mission_id/observations/:obs_id/comments` — все комментарии observation.
- `GET /api/projects/:project_id/missions/:mission_id/observations/:obs_id/comments/:comment_id` — один комментарий.
- `POST /api/projects/:project_id/missions/:mission_id/observations/:obs_id/comments` — создать комментарий к observation.
- `PUT|PATCH /api/projects/:project_id/missions/:mission_id/observations/:obs_id/comments/:comment_id` — обновить комментарий. Обычно разрешено автору комментария, владельцу проекта или `admin`.
- `DELETE /api/projects/:project_id/missions/:mission_id/observations/:obs_id/comments/:comment_id` — удалить комментарий. Обычно разрешено автору комментария, владельцу проекта или `admin`.

```typescript
export class CreateObservationCommentDto {
  comment: string;
  parent_comment_id?: string | null; // null или отсутствие поля = корневой комментарий
}

export class UpdateObservationCommentDto {
  comment?: string;
}

export class ObservationCommentResponseDto {
  id: string;
  observation_id: string;
  user_id: string;
  parent_comment_id: string | null;
  comment: string;
  created_at: string;
  updated_at: string;
}
```

## Participations (`/api/participations`)

- `GET /api/participations/:project_id` — участники проекта.
- `POST /api/participations/:project_id` — вступить в проект. Требуется токен.
- `DELETE /api/participations/:project_id/:user_id` — прекратить участие. Требуется токен пользователя или `admin`.

```typescript
export class ParticipationResponseDto {
  id: string;
  user_id: string;
  project_id: string;
  user_name?: string;
}
```
