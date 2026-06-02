# itplow backend

Микросервисный backend для платформы проектов гражданской науки.

## Структура

```text
backend/
├── docker-compose.yml
├── nginx.conf
├── gateway/
├── user-service/
├── project-service/
└── observation-service/
```

## Сервисы

- `gateway` (`:8080`) — единая точка входа, проксирование `/api/*`, проверка сессии в Redis.
- `user-service` (`:8081`) — регистрация, логин, профиль, participations.
- `project-service` (`:8082`) — проекты и миссии.
- `observation-service` (`:8083`) — observations, comments, загрузка файлов в MinIO.

## Инфраструктура

`docker-compose.yml` поднимает:

- `users-db` — PostgreSQL для `user-service`
- `projects-db` — PostgreSQL для `project-service`
- `observations-db` — PostgreSQL для `observation-service`
- `redis` — общие сессии и pub/sub
- `minio` — хранение файлов observations
- `gateway`, `user-service`, `project-service`, `observation-service`

## Конфигурация

У каждого сервиса есть свой `.env.example`:

- [gateway/.env.example](gateway/.env.example)
- [user-service/.env.example](user-service/.env.example)
- [project-service/.env.example](project-service/.env.example)
- [observation-service/.env.example](observation-service/.env.example)

Ключевые переменные:

- `DATABASE_URL` — своя БД у каждого сервиса
- `REDIS_URL` — общий Redis
- `JWT_SECRET` — один и тот же секрет у всех сервисов и gateway
- `CORS_ALLOWED_ORIGINS` — список разрешённых origin для gateway через запятую
- `PROJECT_SERVICE_URL` — нужен `user-service` для получения проектов пользователя
- `PROJECT_SERVICE_URL` — также нужен `observation-service` для проверки project/mission-контекста и модерации учёным
- `MINIO_*` — нужны `observation-service` для хранения файлов

## Запуск

Локальная сборка workspace:

```bash
cargo check --workspace
```

Запуск всей инфраструктуры:

```bash
docker compose up --build
```

После старта доступны:

- `GET http://localhost:8080/health`
- `GET http://localhost:8081/health`
- `GET http://localhost:8082/health`
- `GET http://localhost:8083/health`
- `MinIO console: http://localhost:9001`

## Аутентификация

- `POST /api/users` — регистрация
- `POST /api/auth/login` — логин, выдача JWT
- `POST /api/auth/logout` — удаление сессии в Redis
- все непубличные запросы идут с `Authorization: Bearer <token>`
- публичная регистрация поддерживает только роли `volunteer` и `scientist`
- `admin` — системная роль, не создаётся через публичную регистрацию

Gateway проверяет наличие `session:{token}` в Redis, а downstream-сервисы дополнительно валидируют тот же токен напрямую.

## Основные маршруты

### user-service

- `POST /users`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`
- `PUT /users/me`
- `PATCH /users/me`
- `GET /users/:id`
- `GET /users/:id/projects`
- `GET /participations/:project_id`
- `POST /participations/:project_id`
- `DELETE /participations/:project_id/:user_id`

### project-service

- `GET /projects`
- `GET /projects/by_tags` — фильтрация проектов по одному или нескольким тегам
- `GET /projects/:id`
- `POST /projects` — только `scientist` или `admin`
- `PUT /projects/:id` — владелец-`scientist` или `admin`
- `PATCH /projects/:id` — владелец-`scientist` или `admin`
- `DELETE /projects/:id` — владелец-`scientist` или `admin`
- `GET /projects/:id/missions`
- `GET /projects/:id/missions/:mission_id`
- `POST /projects/:id/missions` — владелец-`scientist` или `admin`
- `PUT /projects/:id/missions/:mission_id` — владелец-`scientist` или `admin`
- `PATCH /projects/:id/missions/:mission_id` — владелец-`scientist` или `admin`
- `DELETE /projects/:id/missions/:mission_id` — владелец-`scientist` или `admin`
- `GET /internal/users/:user_id/projects`

Project содержит:

- `title`
- `description`
- `status`
- `tags`

Во внешнем API `tags` передаются и возвращаются как массив строк, но в PostgreSQL они хранятся в отдельной таблице `tags` с полями `project_id` и `name`.

### observation-service

- `GET /projects/:project_id/missions/:mission_id/observations`
- `GET /projects/:project_id/missions/:mission_id/observations/:obs_id`
- `POST /projects/:project_id/missions/:mission_id/observations`
- `PUT /projects/:project_id/missions/:mission_id/observations/:obs_id`
- `PATCH /projects/:project_id/missions/:mission_id/observations/:obs_id`
- `DELETE /projects/:project_id/missions/:mission_id/observations/:obs_id`
- `GET /projects/:project_id/missions/:mission_id/observations/:obs_id/comments`
- `POST /projects/:project_id/missions/:mission_id/observations/:obs_id/comments`
- `PUT /projects/:project_id/missions/:mission_id/observations/:obs_id/comments/:comment_id`
- `PATCH /projects/:project_id/missions/:mission_id/observations/:obs_id/comments/:comment_id`
- `DELETE /projects/:project_id/missions/:mission_id/observations/:obs_id/comments/:comment_id`
- `GET /projects/:project_id/missions/:mission_id/observations/:obs_id/files`
- `POST /projects/:project_id/missions/:mission_id/observations/:obs_id/files`

Observation содержит:

- `title`
- `description`
- `place`
- `status`
- файлы и комментарии

`POST /projects/:project_id/missions/:mission_id/observations` поддерживает два формата:

- `application/json` — создание отчёта без файла:

```json
{
  "title": "Наблюдение в парке",
  "description": "Описание результата",
  "place": "Москва, парк Сокольники"
}
```

- `multipart/form-data` — создание отчёта и загрузка файла одним запросом:

```text
title=Наблюдение в парке
description=Описание результата
place=Москва, парк Сокольники
file=<binary>
file_title=photo.jpg
```

Поле `file_title` необязательное: если его нет, сервис использует имя файла из multipart-запроса. Отдельный `POST /projects/:project_id/missions/:mission_id/observations/:obs_id/files` остаётся доступен для добавления файла к уже созданному отчёту.

Файлы не хранятся в PostgreSQL как бинарные данные. `observation-service` загружает файл в MinIO bucket `observations`, а в таблицу `observation_files` сохраняет метаданные: `title`, `file_type`, `url`, `object_key`. В ответах API для файлов возвращается `download_url` — временная presigned-ссылка для отображения или скачивания файла на фронтенде.

## Технические детали

- миграции запускаются автоматически при старте каждого сервиса через `sqlx::migrate!`
- `user-service` публикует `user.created` в Redis pub/sub
- `project-service` публикует `project.created` и `mission.created`
- `project-service` хранит теги проектов в отдельной таблице `tags`, связанной с `projects` по `project_id`
- `observation-service` создаёт bucket в MinIO при старте, если его ещё нет
- gateway, `observation-service` и nginx принимают загрузки файлов до `20 MB`

## Проверка

Сейчас проверено:

```bash
cargo check --workspace
docker compose up -d --build
```

Также вручную проверены:

- `GET /health` на `gateway`, `user-service`, `project-service`, `observation-service`
- CORS/preflight через `gateway` для локальных origin `http://localhost:3000`, `http://127.0.0.1:3000`, `http://[::]:3000`
