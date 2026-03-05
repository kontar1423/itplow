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

## Projects (`/api/projects`)

- `GET /api/projects` — список проектов.
- `GET /api/projects/:id` — проект по id.
- `GET /api/projects/by_tags` — проекты с определёнными тэгами. Требует массив `tags`.
- `PUT|PATCH /api/projects/:id` — частичное/полное обновление проекта. Токен обязателен(или role `admin`).
- `POST /api/projects` — создание проекта.
- `DELETE /api/projects/:id` — удалить проект. Токен обязателен(или role `admin`).

### Missions

- `POST /api/projects/:project_id/missions` — создание миссии.
- `PUT|PATCH /api/projects/:project_id/missions/:mission_id` — частичное/полное обновление миссии. Токен обязателен(или role `admin`).
- `DELETE /api/projects/:project_id/missions/:mission_id` — удалить миссию. Токен обязателен(или role `admin`).
- `GET /api/projects/:project_id/missions` — Миссии определённого проекта.
- `GET /api/projects/:project_id/missions/:mission_id` — Миссия одного проекта.

### Observations

- `POST /api/projects/:project_id/missions/:missions_id/observations` — создание наблюдения.
- `PUT|PATCH /api/projects/:project_id/missions/:missions_id/observations/:obs_id` — частичное/полное обновление наблюдения. Токен обязателен(или role `admin`).
- `DELETE /api/projects/:project_id/missions/:missions_id/observations/:obs_id` — удалить наблюдение. Токен обязателен(role `admin` или владелец данного project).
- `GET /api/projects/:project_id/missions/:missions_id/observations` — Наблюдения определённой миссии.
- `GET /api/projects/:project_id/missions/:missions_id/observations/:obs_id` — Наблюдение одной миссии.

## Participations (`/api/participations`)

- `GET /api/participations/:project_id` — участники проекта.
- `POST /api/participations/:project_id` — поучаствовать. Требуется токен.
- `DELETE /api/participations/:project_id/:user_id` — прекратить участвовать. Токен обязателен(или role `admin`).
