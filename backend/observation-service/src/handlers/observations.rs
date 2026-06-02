use actix_multipart::Multipart;
use actix_web::{Either, HttpResponse, web};
use bytes::BytesMut;
use chrono::Utc;
use futures_util::TryStreamExt;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{AppState, errors::AppError, middleware::auth::AuthenticatedUser, project_client};

use super::{
    comments::ObservationCommentRecord,
    files::{ObservationFileRecord, ObservationFileResponse, is_allowed_mime_type},
};

#[derive(Debug, Deserialize)]
pub struct CreateObservationDto {
    pub title: String,
    pub description: Option<String>,
    pub place: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateObservationDto {
    pub title: Option<String>,
    pub description: Option<String>,
    pub place: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ObservationRecord {
    pub id: Uuid,
    pub user_id: Uuid,
    pub mission_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub place: Option<String>,
    pub status: String,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ObservationDetails {
    #[serde(flatten)]
    pub observation: ObservationRecord,
    pub comments: Vec<ObservationCommentRecord>,
    pub files: Vec<ObservationFileRecord>,
}

#[derive(Debug, Serialize)]
pub struct CreatedObservationDetails {
    #[serde(flatten)]
    pub observation: ObservationRecord,
    pub comments: Vec<ObservationCommentRecord>,
    pub files: Vec<ObservationFileResponse>,
}

struct CreateObservationMultipart {
    observation: CreateObservationDto,
    file: Option<MultipartFile>,
}

struct MultipartFile {
    title: String,
    file_type: String,
    bytes: bytes::Bytes,
}

pub async fn list_observations(
    state: web::Data<AppState>,
    _auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id) = path.into_inner();
    project_client::ensure_mission_in_project(&state, project_id, mission_id).await?;

    let rows = sqlx::query_as::<_, ObservationRecord>(
        r#"
        SELECT id, user_id, mission_id, title, description, place, status, created_at
        FROM observations
        WHERE mission_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(mission_id)
    .fetch_all(&state.db)
    .await?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn get_observation(
    state: web::Data<AppState>,
    _auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id) = path.into_inner();
    let observation =
        ensure_observation_context(&state, project_id, mission_id, observation_id).await?;
    let comments = super::comments::fetch_comments(&state, observation_id).await?;
    let files = super::files::fetch_files(&state, observation_id).await?;

    Ok(HttpResponse::Ok().json(ObservationDetails {
        observation,
        comments,
        files,
    }))
}

pub async fn create_observation(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid)>,
    payload: Either<web::Json<CreateObservationDto>, Multipart>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id) = path.into_inner();
    project_client::ensure_mission_in_project(&state, project_id, mission_id).await?;

    let (payload, file) = match payload {
        Either::Left(json) => (json.into_inner(), None),
        Either::Right(multipart) => {
            let parsed = parse_create_observation_multipart(multipart).await?;
            (parsed.observation, parsed.file)
        }
    };

    let title = payload.title.trim();
    if title.is_empty() {
        return Err(AppError::BadRequest(
            "Observation title is required".to_string(),
        ));
    }

    let row = sqlx::query_as::<_, ObservationRecord>(
        r#"
        INSERT INTO observations (user_id, mission_id, title, description, place, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING id, user_id, mission_id, title, description, place, status, created_at
        "#,
    )
    .bind(auth.user_id)
    .bind(mission_id)
    .bind(title)
    .bind(payload.description.as_deref())
    .bind(payload.place.as_deref())
    .fetch_one(&state.db)
    .await?;

    log::info!(
        "observation created: id={}, mission_id={}, author_id={}",
        row.id,
        row.mission_id,
        auth.user_id
    );

    let mut files = Vec::new();
    if let Some(file) = file {
        let uploaded = super::files::create_file_record(
            &state,
            row.id,
            file.title,
            file.file_type,
            file.bytes,
        )
        .await?;
        files.push(uploaded);
    }

    Ok(HttpResponse::Created().json(CreatedObservationDetails {
        observation: row,
        comments: Vec::new(),
        files,
    }))
}

async fn parse_create_observation_multipart(
    mut payload: Multipart,
) -> Result<CreateObservationMultipart, AppError> {
    let mut title: Option<String> = None;
    let mut description: Option<String> = None;
    let mut place: Option<String> = None;
    let mut file_title: Option<String> = None;
    let mut file_name: Option<String> = None;
    let mut file_type = "application/octet-stream".to_string();
    let mut file_bytes = BytesMut::new();

    while let Some(mut field) = payload.try_next().await? {
        let field_name = field.name().unwrap_or_default().to_string();

        if field_name == "file" {
            if let Some(disposition) = field.content_disposition() {
                if let Some(filename) = disposition.get_filename() {
                    file_name = Some(filename.to_string());
                }
            }
            if let Some(content_type) = field.content_type() {
                file_type = content_type.to_string();
            }
            while let Some(chunk) = field.try_next().await? {
                file_bytes.extend_from_slice(&chunk);
            }
            continue;
        }

        let value = read_text_field(&mut field).await?;
        match field_name.as_str() {
            "title" => title = Some(value),
            "description" => description = non_empty(value),
            "place" => place = non_empty(value),
            "file_title" => file_title = non_empty(value),
            _ => {}
        }
    }

    let title =
        title.ok_or_else(|| AppError::BadRequest("Field `title` is required".to_string()))?;
    let file = if file_bytes.is_empty() {
        None
    } else {
        if !is_allowed_mime_type(&file_type) {
            return Err(AppError::BadRequest(format!(
                "File type '{}' is not allowed",
                file_type
            )));
        }
        Some(MultipartFile {
            title: file_title
                .or(file_name)
                .unwrap_or_else(|| format!("file-{}", Uuid::new_v4())),
            file_type,
            bytes: file_bytes.freeze(),
        })
    };

    Ok(CreateObservationMultipart {
        observation: CreateObservationDto {
            title,
            description,
            place,
        },
        file,
    })
}

async fn read_text_field(
    field: &mut actix_multipart::Field,
) -> Result<String, actix_multipart::MultipartError> {
    let mut value = BytesMut::new();
    while let Some(chunk) = field.try_next().await? {
        value.extend_from_slice(&chunk);
    }
    Ok(String::from_utf8_lossy(&value).trim().to_string())
}

fn non_empty(value: String) -> Option<String> {
    if value.is_empty() { None } else { Some(value) }
}

pub async fn update_observation(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid)>,
    payload: web::Json<UpdateObservationDto>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id) = path.into_inner();
    let current =
        ensure_observation_context(&state, project_id, mission_id, observation_id).await?;

    let can_edit_content = current.user_id == auth.user_id || auth.is_admin();
    let can_moderate = can_moderate_observation(&state, &auth, project_id).await?;

    if (payload.title.is_some() || payload.description.is_some() || payload.place.is_some())
        && !can_edit_content
    {
        return Err(AppError::Forbidden("Observation access denied".to_string()));
    }

    if payload.status.is_some() && !can_moderate {
        return Err(AppError::Forbidden(
            "Only project scientist owner or admin can change observation status".to_string(),
        ));
    }

    let row = sqlx::query_as::<_, ObservationRecord>(
        r#"
        UPDATE observations
        SET
          title = $2,
          description = $3,
          place = $4,
          status = $5
        WHERE id = $1
        RETURNING id, user_id, mission_id, title, description, place, status, created_at
        "#,
    )
    .bind(observation_id)
    .bind(payload.title.as_deref().unwrap_or(&current.title))
    .bind(
        payload
            .description
            .as_deref()
            .or(current.description.as_deref()),
    )
    .bind(payload.place.as_deref().or(current.place.as_deref()))
    .bind(payload.status.as_deref().unwrap_or(&current.status))
    .fetch_one(&state.db)
    .await?;

    log::info!(
        "observation updated: id={}, actor_id={}, status_changed={}",
        observation_id,
        auth.user_id,
        payload.status.is_some()
    );

    Ok(HttpResponse::Ok().json(row))
}

pub async fn delete_observation(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid)>,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id) = path.into_inner();
    let current =
        ensure_observation_context(&state, project_id, mission_id, observation_id).await?;
    if current.user_id != auth.user_id && !auth.is_admin() {
        return Err(AppError::Forbidden("Observation access denied".to_string()));
    }

    let result = sqlx::query("DELETE FROM observations WHERE id = $1")
        .bind(observation_id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Observation not found".to_string()));
    }

    log::info!(
        "observation deleted: id={}, actor_id={}",
        observation_id,
        auth.user_id
    );

    Ok(HttpResponse::NoContent().finish())
}

pub async fn fetch_observation(
    state: &AppState,
    observation_id: Uuid,
) -> Result<ObservationRecord, AppError> {
    sqlx::query_as::<_, ObservationRecord>(
        r#"
        SELECT id, user_id, mission_id, title, description, place, status, created_at
        FROM observations
        WHERE id = $1
        "#,
    )
    .bind(observation_id)
    .fetch_one(&state.db)
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => AppError::NotFound("Observation not found".to_string()),
        other => AppError::Sqlx(other),
    })
}

pub async fn ensure_observation_context(
    state: &AppState,
    project_id: Uuid,
    mission_id: Uuid,
    observation_id: Uuid,
) -> Result<ObservationRecord, AppError> {
    project_client::ensure_mission_in_project(state, project_id, mission_id).await?;
    let observation = fetch_observation(state, observation_id).await?;
    if observation.mission_id != mission_id {
        return Err(AppError::NotFound(
            "Observation not found in this mission".to_string(),
        ));
    }
    Ok(observation)
}

async fn can_moderate_observation(
    state: &AppState,
    auth: &AuthenticatedUser,
    project_id: Uuid,
) -> Result<bool, AppError> {
    if auth.is_admin() {
        return Ok(true);
    }

    if !auth.is_scientist() {
        return Ok(false);
    }

    let owner_id = project_client::fetch_project_owner_id(state, project_id).await?;
    Ok(owner_id == auth.user_id)
}
