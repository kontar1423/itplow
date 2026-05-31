use actix_multipart::Multipart;
use actix_web::{HttpResponse, web};
use bytes::BytesMut;
use chrono::Utc;
use futures_util::TryStreamExt;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{AppState, errors::AppError, middleware::auth::AuthenticatedUser, storage::Storage};

const ALLOWED_MIME_TYPES: &[&str] = &[
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "application/pdf",
    "text/plain",
];

pub fn is_allowed_mime_type(mime: &str) -> bool {
    let base = mime.split(';').next().unwrap_or(mime).trim();
    ALLOWED_MIME_TYPES.contains(&base)
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ObservationFileRecord {
    pub id: Uuid,
    pub observation_id: Uuid,
    pub title: String,
    pub file_type: String,
    pub url: String,
    pub object_key: String,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ObservationFileResponse {
    pub id: Uuid,
    pub observation_id: Uuid,
    pub title: String,
    pub file_type: String,
    pub url: String,
    pub download_url: String,
    pub created_at: chrono::DateTime<Utc>,
}

pub async fn upload_file(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    path: web::Path<(Uuid, Uuid, Uuid)>,
    mut payload: Multipart,
) -> Result<HttpResponse, AppError> {
    let (project_id, mission_id, observation_id) = path.into_inner();
    let observation = super::observations::ensure_observation_context(
        &state,
        project_id,
        mission_id,
        observation_id,
    )
    .await?;
    if observation.user_id != auth.user_id && !auth.is_admin() {
        return Err(AppError::Forbidden("Observation access denied".to_string()));
    }

    let mut title: Option<String> = None;
    let mut file_name: Option<String> = None;
    let mut file_type = "application/octet-stream".to_string();
    let mut file_bytes = BytesMut::new();

    while let Some(mut field) = payload.try_next().await? {
        let field_name = field.name().unwrap_or_default().to_string();
        if field_name == "title" {
            let mut value = BytesMut::new();
            while let Some(chunk) = field.try_next().await? {
                value.extend_from_slice(&chunk);
            }
            title = Some(String::from_utf8_lossy(&value).trim().to_string());
            continue;
        }

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
        }
    }

    if file_bytes.is_empty() {
        return Err(AppError::BadRequest(
            "Multipart field `file` is required".to_string(),
        ));
    }

    if !is_allowed_mime_type(&file_type) {
        return Err(AppError::BadRequest(format!(
            "File type '{}' is not allowed",
            file_type
        )));
    }

    let title = title
        .or(file_name)
        .unwrap_or_else(|| format!("file-{}", Uuid::new_v4()));

    let response = create_file_record(
        &state,
        observation_id,
        title,
        file_type,
        file_bytes.freeze(),
    )
    .await?;

    log::info!(
        "file uploaded: id={}, observation_id={}, actor_id={}",
        response.id,
        observation_id,
        auth.user_id
    );

    Ok(HttpResponse::Created().json(response))
}

pub async fn create_file_record(
    state: &AppState,
    observation_id: Uuid,
    title: String,
    file_type: String,
    file_bytes: bytes::Bytes,
) -> Result<ObservationFileResponse, AppError> {
    let (object_key, url) = upload_to_storage(
        &state.storage,
        observation_id,
        &title,
        file_bytes,
        &file_type,
    )
    .await?;
    let row = sqlx::query_as::<_, ObservationFileRecord>(
        r#"
        INSERT INTO observation_files (observation_id, title, file_type, url, object_key)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, observation_id, title, file_type, url, object_key, created_at
        "#,
    )
    .bind(observation_id)
    .bind(title)
    .bind(file_type)
    .bind(url)
    .bind(object_key)
    .fetch_one(&state.db)
    .await?;

    to_response(&state.storage, row).await
}

pub async fn list_files(
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
    let rows = fetch_files(&state, observation_id).await?;
    let mut response = Vec::with_capacity(rows.len());
    for row in rows {
        response.push(to_response(&state.storage, row).await?);
    }
    Ok(HttpResponse::Ok().json(response))
}

pub async fn fetch_files(
    state: &AppState,
    observation_id: Uuid,
) -> Result<Vec<ObservationFileRecord>, AppError> {
    let rows = sqlx::query_as::<_, ObservationFileRecord>(
        r#"
        SELECT id, observation_id, title, file_type, url, object_key, created_at
        FROM observation_files
        WHERE observation_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(observation_id)
    .fetch_all(&state.db)
    .await?;
    Ok(rows)
}

async fn upload_to_storage(
    storage: &Storage,
    observation_id: Uuid,
    title: &str,
    bytes: bytes::Bytes,
    content_type: &str,
) -> Result<(String, String), AppError> {
    storage
        .upload(observation_id, title, bytes, content_type)
        .await
}

async fn to_response(
    storage: &Storage,
    row: ObservationFileRecord,
) -> Result<ObservationFileResponse, AppError> {
    let download_url = storage.presigned_url(&row.object_key).await?;
    Ok(ObservationFileResponse {
        id: row.id,
        observation_id: row.observation_id,
        title: row.title,
        file_type: row.file_type,
        url: row.url,
        download_url,
        created_at: row.created_at,
    })
}
