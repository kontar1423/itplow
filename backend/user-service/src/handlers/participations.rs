use actix_web::{HttpResponse, web};
use chrono::Utc;
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

use crate::{AppState, errors::AppError, middleware::auth::AuthenticatedUser};

#[derive(Debug, Serialize, FromRow)]
pub struct ParticipationWithUser {
    pub id: Uuid,
    pub user_id: Uuid,
    pub project_id: Uuid,
    pub created_at: chrono::DateTime<Utc>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub role: String,
}

pub async fn list_participants(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let project_id = path.into_inner();
    let rows = sqlx::query_as::<_, ParticipationWithUser>(
        r#"
        SELECT
            p.id,
            p.user_id,
            p.project_id,
            p.created_at,
            u.first_name,
            u.last_name,
            u.role
        FROM participations p
        JOIN users u ON u.id = p.user_id
        WHERE p.project_id = $1
        ORDER BY p.created_at DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn join_project(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let project_id = path.into_inner();
    let row = sqlx::query_as::<_, ParticipationWithUser>(
        r#"
        WITH inserted AS (
            INSERT INTO participations (user_id, project_id)
            VALUES ($1, $2)
            RETURNING id, user_id, project_id, created_at
        )
        SELECT
            inserted.id,
            inserted.user_id,
            inserted.project_id,
            inserted.created_at,
            u.first_name,
            u.last_name,
            u.role
        FROM inserted
        JOIN users u ON u.id = inserted.user_id
        "#,
    )
    .bind(auth.user_id)
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .map_err(map_constraint_error)?;

    Ok(HttpResponse::Created().json(row))
}

pub async fn leave_project(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, user_id) = path.into_inner();
    if auth.user_id != user_id && !auth.is_admin() {
        return Err(AppError::Forbidden(
            "You can remove only your own participation".to_string(),
        ));
    }

    let result = sqlx::query(
        r#"
        DELETE FROM participations
        WHERE project_id = $1 AND user_id = $2
        "#,
    )
    .bind(project_id)
    .bind(user_id)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Participation not found".to_string()));
    }

    Ok(HttpResponse::NoContent().finish())
}

fn map_constraint_error(err: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(db_err) = &err {
        if db_err.is_unique_violation() {
            return AppError::Conflict("User already participates in this project".to_string());
        }
    }
    AppError::Sqlx(err)
}
