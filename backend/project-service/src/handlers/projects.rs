use actix_web::{HttpResponse, web};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{
    AppState, errors::AppError, middleware::auth::AuthenticatedUser, redis::publish_event,
};

#[derive(Debug, Deserialize)]
pub struct CreateProjectDto {
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectDto {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct ProjectListQuery {
    pub title: Option<String>,
    pub tag: Option<String>,
    pub user_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct TagsQuery {
    pub tags: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ProjectRecord {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub tags: Vec<String>,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize)]
struct ProjectCreatedEvent {
    id: Uuid,
    user_id: Uuid,
}

pub async fn list_projects(
    state: web::Data<AppState>,
    query: web::Query<ProjectListQuery>,
) -> Result<HttpResponse, AppError> {
    let title = query
        .title
        .as_ref()
        .map(|value| format!("%{}%", value.to_lowercase()));
    let tag = query.tag.as_ref().map(|value| value.to_lowercase());

    let rows = sqlx::query_as::<_, ProjectRecord>(
        r#"
        SELECT id, user_id, title, description, status, tags, created_at
        FROM projects
        WHERE ($1::text IS NULL OR lower(title) LIKE $1)
          AND ($2::text IS NULL OR EXISTS (
              SELECT 1 FROM unnest(tags) AS tag_value WHERE lower(tag_value) = $2
          ))
          AND ($3::uuid IS NULL OR user_id = $3)
        ORDER BY created_at DESC
        "#,
    )
    .bind(title)
    .bind(tag)
    .bind(query.user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn get_project(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let row = fetch_project(&state, path.into_inner()).await?;
    Ok(HttpResponse::Ok().json(row))
}

pub async fn by_tags(
    state: web::Data<AppState>,
    query: web::Query<TagsQuery>,
) -> Result<HttpResponse, AppError> {
    let tags: Vec<String> = query
        .tags
        .split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|value| value.to_lowercase())
        .collect();

    let rows = sqlx::query_as::<_, ProjectRecord>(
        r#"
        SELECT id, user_id, title, description, status, tags, created_at
        FROM projects
        WHERE tags && $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(tags)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn create_project(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    payload: web::Json<CreateProjectDto>,
) -> Result<HttpResponse, AppError> {
    if !auth.can_manage_projects() {
        return Err(AppError::Forbidden(
            "Only scientist or admin can create projects".to_string(),
        ));
    }

    let row = sqlx::query_as::<_, ProjectRecord>(
        r#"
        INSERT INTO projects (user_id, title, description, status, tags)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, title, description, status, tags, created_at
        "#,
    )
    .bind(auth.user_id)
    .bind(payload.title.trim())
    .bind(payload.description.as_deref())
    .bind(payload.status.trim())
    .bind(payload.tags.clone().unwrap_or_default())
    .fetch_one(&state.db)
    .await?;

    if let Err(err) = publish_event(
        state.get_ref(),
        "project.created",
        &ProjectCreatedEvent {
            id: row.id,
            user_id: row.user_id,
        },
    )
    .await
    {
        log::warn!("failed to publish project.created for {}: {}", row.id, err);
    }

    log::info!("project created: id={}, owner_id={}", row.id, row.user_id);

    Ok(HttpResponse::Created().json(row))
}

pub async fn update_project(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<Uuid>,
    payload: web::Json<UpdateProjectDto>,
) -> Result<HttpResponse, AppError> {
    let project_id = path.into_inner();
    ensure_project_access(&state, &auth, project_id).await?;
    let current = fetch_project(&state, project_id).await?;

    let row = sqlx::query_as::<_, ProjectRecord>(
        r#"
        UPDATE projects
        SET title = $2, description = $3, status = $4, tags = $5
        WHERE id = $1
        RETURNING id, user_id, title, description, status, tags, created_at
        "#,
    )
    .bind(project_id)
    .bind(payload.title.as_deref().unwrap_or(&current.title))
    .bind(
        payload
            .description
            .as_deref()
            .or(current.description.as_deref()),
    )
    .bind(payload.status.as_deref().unwrap_or(&current.status))
    .bind(payload.tags.clone().unwrap_or(current.tags))
    .fetch_one(&state.db)
    .await?;

    log::info!(
        "project updated: id={}, actor_id={}",
        project_id,
        auth.user_id
    );

    Ok(HttpResponse::Ok().json(row))
}

pub async fn delete_project(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let project_id = path.into_inner();
    ensure_project_access(&state, &auth, project_id).await?;
    let result = sqlx::query("DELETE FROM projects WHERE id = $1")
        .bind(project_id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Project not found".to_string()));
    }

    log::info!(
        "project deleted: id={}, actor_id={}",
        project_id,
        auth.user_id
    );

    Ok(HttpResponse::NoContent().finish())
}

pub async fn user_projects(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let user_id = path.into_inner();
    let rows = sqlx::query_as::<_, ProjectRecord>(
        r#"
        SELECT id, user_id, title, description, status, tags, created_at
        FROM projects
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn fetch_project(state: &AppState, project_id: Uuid) -> Result<ProjectRecord, AppError> {
    sqlx::query_as::<_, ProjectRecord>(
        r#"
        SELECT id, user_id, title, description, status, tags, created_at
        FROM projects
        WHERE id = $1
        "#,
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => AppError::NotFound("Project not found".to_string()),
        other => AppError::Sqlx(other),
    })
}

pub async fn ensure_project_access(
    state: &AppState,
    auth: &AuthenticatedUser,
    project_id: Uuid,
) -> Result<ProjectRecord, AppError> {
    let project = fetch_project(state, project_id).await?;
    if !(auth.is_admin() || (project.user_id == auth.user_id && auth.is_scientist())) {
        return Err(AppError::Forbidden("Project access denied".to_string()));
    }
    Ok(project)
}
