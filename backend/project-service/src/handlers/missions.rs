use actix_web::{HttpResponse, web};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{
    AppState, errors::AppError, handlers::projects::ensure_project_access,
    middleware::auth::AuthenticatedUser, redis::publish_event,
};

#[derive(Debug, Deserialize)]
pub struct CreateMissionDto {
    pub title: String,
    pub description: Option<String>,
    pub requirements: Option<String>,
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMissionDto {
    pub title: Option<String>,
    pub description: Option<String>,
    pub requirements: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct MissionRecord {
    pub id: Uuid,
    pub project_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub requirements: Option<String>,
    pub status: String,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize)]
struct MissionCreatedEvent {
    id: Uuid,
    project_id: Uuid,
}

pub async fn list_missions(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let project_id = path.into_inner();
    let rows = sqlx::query_as::<_, MissionRecord>(
        r#"
        SELECT id, project_id, title, description, requirements, status, created_at
        FROM missions
        WHERE project_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn get_mission(
    state: web::Data<AppState>,
    path: web::Path<(Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id) = path.into_inner();
    let row = fetch_mission_in_project(&state, project_id, mission_id).await?;
    Ok(HttpResponse::Ok().json(row))
}

pub async fn create_mission(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<Uuid>,
    payload: web::Json<CreateMissionDto>,
) -> Result<HttpResponse, AppError> {
    let project_id = path.into_inner();
    ensure_project_access(&state, &auth, project_id).await?;

    let row = sqlx::query_as::<_, MissionRecord>(
        r#"
        INSERT INTO missions (project_id, title, description, requirements, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, project_id, title, description, requirements, status, created_at
        "#,
    )
    .bind(project_id)
    .bind(payload.title.trim())
    .bind(payload.description.as_deref())
    .bind(payload.requirements.as_deref())
    .bind(payload.status.trim())
    .fetch_one(&state.db)
    .await?;

    if let Err(err) = publish_event(
        state.get_ref(),
        "mission.created",
        &MissionCreatedEvent {
            id: row.id,
            project_id: row.project_id,
        },
    )
    .await
    {
        log::warn!("failed to publish mission.created for {}: {}", row.id, err);
    }

    log::info!(
        "mission created: id={}, project_id={}, actor_id={}",
        row.id,
        row.project_id,
        auth.user_id
    );

    Ok(HttpResponse::Created().json(row))
}

pub async fn update_mission(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid)>,
    payload: web::Json<UpdateMissionDto>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id) = path.into_inner();
    ensure_project_access(&state, &auth, project_id).await?;
    let current = fetch_mission_in_project(&state, project_id, mission_id).await?;

    let row = sqlx::query_as::<_, MissionRecord>(
        r#"
        UPDATE missions
        SET title = $2, description = $3, requirements = $4, status = $5
        WHERE id = $1
        RETURNING id, project_id, title, description, requirements, status, created_at
        "#,
    )
    .bind(mission_id)
    .bind(payload.title.as_deref().unwrap_or(&current.title))
    .bind(
        payload
            .description
            .as_deref()
            .or(current.description.as_deref()),
    )
    .bind(
        payload
            .requirements
            .as_deref()
            .or(current.requirements.as_deref()),
    )
    .bind(payload.status.as_deref().unwrap_or(&current.status))
    .fetch_one(&state.db)
    .await?;

    log::info!(
        "mission updated: id={}, project_id={}, actor_id={}",
        mission_id,
        project_id,
        auth.user_id
    );

    Ok(HttpResponse::Ok().json(row))
}

pub async fn delete_mission(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id) = path.into_inner();
    ensure_project_access(&state, &auth, project_id).await?;
    let _ = fetch_mission_in_project(&state, project_id, mission_id).await?;

    let result = sqlx::query("DELETE FROM missions WHERE id = $1")
        .bind(mission_id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Mission not found".to_string()));
    }

    log::info!(
        "mission deleted: id={}, project_id={}, actor_id={}",
        mission_id,
        project_id,
        auth.user_id
    );

    Ok(HttpResponse::NoContent().finish())
}

async fn fetch_mission_in_project(
    state: &AppState,
    project_id: Uuid,
    mission_id: Uuid,
) -> Result<MissionRecord, AppError> {
    sqlx::query_as::<_, MissionRecord>(
        r#"
        SELECT id, project_id, title, description, requirements, status, created_at
        FROM missions
        WHERE id = $1 AND project_id = $2
        "#,
    )
    .bind(mission_id)
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => {
            AppError::NotFound("Mission not found in this project".to_string())
        }
        other => AppError::Sqlx(other),
    })
}
