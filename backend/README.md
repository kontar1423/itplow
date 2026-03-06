# Api endpoints documentation

## Пользователи (`/api/users`)

- `GET /api/users` — список пользователей.
- `GET /api/users/me` — профиль по access токену. Также получает все свои participations.
- `GET /api/users/:id` — профиль по id
- `GET /api/users/:id/projects` — проекты определённого пользователя.
- `PUT|PATCH /api/users/me` — частичное/полное обновление текущего пользователя (только поля профиля, без email). Токен обязателен.
- `POST /api/users` — создание пользователя (роль `admin`, иначе по дефолту `user`). Тело: `email` (обяз.), `password` (обяз., ≥6), `firstname?`, `lastname?`, `role?`, `phone?`, `description?`.
- `PUT|PATCH /api/users/:id` — обновление пользователя (только `admin`). Принимает те же текстовые поля, включая `bio` (файл сейчас не обрабатывается).
- `DELETE /api/users/:id` — удалить пользователя (только `admin`).

```typescript
// POST /api/users (Регистрация/Создание)
export class CreateUserDto {
  email: string;         // Обязательно
  password: string;      // Обязательно, >= 6 символов
  firstname?: string;
  lastname?: string;
  phone?: string;
  role?: 'user' | 'admin';
  description?: string;
}

// PUT|PATCH /api/users/me (Обновление профиля)
export class UpdateUserDto {
  firstname?: string;
  lastname?: string;
  phone?: string;
  description?: string; // В README указано, что email менять нельзя
}

// Ответ сервера
export class UserResponseDto {
  id: string; // uuid
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  description: string;
  participations?: ParticipationResponseDto[]; // Для /users/me
}
```

## Projects (`/api/projects`)

- `GET /api/projects` — список проектов.
- `GET /api/projects/:id` — проект по id.
- `GET /api/projects/by_tags` — проекты с определёнными тэгами. Требует массив `tags`.
- `PUT|PATCH /api/projects/:id` — частичное/полное обновление проекта. Токен обязателен(или role `admin`).
- `POST /api/projects` — создание проекта.
- `DELETE /api/projects/:id` — удалить проект. Токен обязателен(или role `admin`).

```typescript
// POST /api/projects
export class CreateProjectDto {
  title: string;
  description: string;
  status: string;
  tags?: string[]; // Теги передаются массивом строк
}

// PUT|PATCH /api/projects/:id
export class UpdateProjectDto {
  title?: string;
  description?: string;
  status?: string;
}

// Ответ сервера
export class ProjectResponseDto {
  id: string;
  user_id: string; // Владелец
  title: string;
  description: string;
  status: string;
  tags: string[]; // Из таблицы proj_tags
}
```

### Missions

- `POST /api/projects/:project_id/missions` — создание миссии.
- `PUT|PATCH /api/projects/:project_id/missions/:mission_id` — частичное/полное обновление миссии. Токен обязателен(или role `admin`).
- `DELETE /api/projects/:project_id/missions/:mission_id` — удалить миссию. Токен обязателен(или role `admin`).
- `GET /api/projects/:project_id/missions` — Миссии определённого проекта.
- `GET /api/projects/:project_id/missions/:mission_id` — Миссия одного проекта.

```typescript
// POST /api/projects/:project_id/missions
export class CreateMissionDto {
  title: string;
  description: string;
  requirements: string;
  status: string;
}

// PUT|PATCH .../missions/:mission_id
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

### Observations

- `POST /api/projects/:project_id/missions/:missions_id/observations` — создание наблюдения.
- `PUT|PATCH /api/projects/:project_id/missions/:missions_id/observations/:obs_id` — частичное/полное обновление наблюдения. Токен обязателен(или role `admin`).
- `DELETE /api/projects/:project_id/missions/:missions_id/observations/:obs_id` — удалить наблюдение. Токен обязателен(role `admin` или владелец данного project).
- `GET /api/projects/:project_id/missions/:missions_id/observations` — Наблюдения определённой миссии.
- `GET /api/projects/:project_id/missions/:missions_id/observations/:obs_id` — Наблюдение одной миссии.

```typescript
// POST /api/projects/:id/missions/:id/observations
export class CreateObservationDto {
  title: string;
  description: string;
}

// PUT|PATCH .../observations/:obs_id
export class UpdateObservationDto {
  title?: string;
  description?: string;
  reviewer_comment?: string; // Только для админа/владельца проекта
  status?: string;
}

// Файлы, прикрепленные к наблюдению (obs_files)
export class ObservationFileDto {
  id: string;
  title: string;
  type: string;
  url: string;
}

export class ObservationResponseDto {
  id: string;
  user_id: string;
  mission_id: string;
  title: string;
  description: string;
  reviewer_comment: string;
  status: string;
  files: ObservationFileDto[]; // Из таблицы obs_files
}
```

## Participations (`/api/participations`)

- `GET /api/participations/:project_id` — участники проекта.
- `POST /api/participations/:project_id` — поучаствовать. Требуется токен.
- `DELETE /api/participations/:project_id/:user_id` — прекратить участвовать. Токен обязателен(или role `admin`).

```typescript
// Ответ сервера на GET /api/participations/:project_id
export class ParticipationResponseDto {
  id: string;
  user_id: string;
  project_id: string;
  // Можно также включить краткие данные о пользователе/проекте
  user_name?: string; 
}
```
