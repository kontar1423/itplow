use actix_web::{HttpResponse, web};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{AppState, errors::AppError, middleware::auth::AuthenticatedUser};

#[derive(Debug, Deserialize)]
pub struct CreateCommentDto {
    pub comment: String,
    pub parent_comment_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCommentDto {
    pub comment: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ObservationCommentRecord {
    pub id: Uuid,
    pub observation_id: Uuid,
    pub user_id: Uuid,
    pub parent_comment_id: Option<Uuid>,
    pub comment: String,
    pub created_at: chrono::DateTime<Utc>,
}

pub async fn list_comments(
    state: web::Data<AppState>,
    path: web::Path<(Uuid, Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id) = path.into_inner();
    let _ = super::observations::ensure_observation_context(
        &state,
        project_id,
        mission_id,
        observation_id,
    )
    .await?;
    let rows = fetch_comments(&state, observation_id).await?;
    Ok(HttpResponse::Ok().json(rows))
}

pub async fn get_comment(
    state: web::Data<AppState>,
    path: web::Path<(Uuid, Uuid, Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id, comment_id) = path.into_inner();
    let _ = super::observations::ensure_observation_context(
        &state,
        project_id,
        mission_id,
        observation_id,
    )
    .await?;
    let row = fetch_comment(&state, observation_id, comment_id).await?;
    Ok(HttpResponse::Ok().json(row))
}

pub async fn create_comment(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid)>,
    payload: web::Json<CreateCommentDto>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id) = path.into_inner();
    let _ = super::observations::ensure_observation_context(
        &state,
        project_id,
        mission_id,
        observation_id,
    )
    .await?;

    if let Some(parent_comment_id) = payload.parent_comment_id {
        let _ = fetch_comment(&state, observation_id, parent_comment_id).await?;
    }

    let row = sqlx::query_as::<_, ObservationCommentRecord>(
        r#"
        INSERT INTO observation_comments (observation_id, user_id, parent_comment_id, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, observation_id, user_id, parent_comment_id, comment, created_at
        "#,
    )
    .bind(observation_id)
    .bind(auth.user_id)
    .bind(payload.parent_comment_id)
    .bind(payload.comment.trim())
    .fetch_one(&state.db)
    .await?;

    log::info!(
        "comment created: id={}, observation_id={}, author_id={}",
        row.id,
        row.observation_id,
        auth.user_id
    );

    Ok(HttpResponse::Created().json(row))
}

pub async fn update_comment(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid, Uuid)>,
    payload: web::Json<UpdateCommentDto>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id, comment_id) = path.into_inner();
    let _ = super::observations::ensure_observation_context(
        &state,
        project_id,
        mission_id,
        observation_id,
    )
    .await?;
    let current = fetch_comment(&state, observation_id, comment_id).await?;
    if current.user_id != auth.user_id && !auth.is_admin() {
        return Err(AppError::Forbidden("Comment access denied".to_string()));
    }

    let row = sqlx::query_as::<_, ObservationCommentRecord>(
        r#"
        UPDATE observation_comments
        SET comment = $2
        WHERE id = $1
        RETURNING id, observation_id, user_id, parent_comment_id, comment, created_at
        "#,
    )
    .bind(comment_id)
    .bind(payload.comment.as_deref().unwrap_or(&current.comment))
    .fetch_one(&state.db)
    .await?;

    log::info!(
        "comment updated: id={}, observation_id={}, actor_id={}",
        comment_id,
        observation_id,
        auth.user_id
    );

    Ok(HttpResponse::Ok().json(row))
}

pub async fn delete_comment(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id, comment_id) = path.into_inner();
    let _ = super::observations::ensure_observation_context(
        &state,
        project_id,
        mission_id,
        observation_id,
    )
    .await?;
    let current = fetch_comment(&state, observation_id, comment_id).await?;
    if current.user_id != auth.user_id && !auth.is_admin() {
        return Err(AppError::Forbidden("Comment access denied".to_string()));
    }

    let result = sqlx::query("DELETE FROM observation_comments WHERE id = $1")
        .bind(comment_id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Comment not found".to_string()));
    }

    log::info!(
        "comment deleted: id={}, observation_id={}, actor_id={}",
        comment_id,
        observation_id,
        auth.user_id
    );

    Ok(HttpResponse::NoContent().finish())
}

pub async fn fetch_comments(
    state: &AppState,
    observation_id: Uuid,
) -> Result<Vec<ObservationCommentRecord>, AppError> {
    let rows = sqlx::query_as::<_, ObservationCommentRecord>(
        r#"
        SELECT id, observation_id, user_id, parent_comment_id, comment, created_at
        FROM observation_comments
        WHERE observation_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(observation_id)
    .fetch_all(&state.db)
    .await?;
    Ok(rows)
}

async fn fetch_comment(
    state: &AppState,
    observation_id: Uuid,
    comment_id: Uuid,
) -> Result<ObservationCommentRecord, AppError> {
    sqlx::query_as::<_, ObservationCommentRecord>(
        r#"
        SELECT id, observation_id, user_id, parent_comment_id, comment, created_at
        FROM observation_comments
        WHERE id = $1 AND observation_id = $2
        "#,
    )
    .bind(comment_id)
    .bind(observation_id)
    .fetch_one(&state.db)
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => AppError::NotFound("Comment not found".to_string()),
        other => AppError::Sqlx(other),
    })
}
