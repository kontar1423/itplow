use reqwest::StatusCode;
use serde::Deserialize;
use uuid::Uuid;

use crate::{AppState, errors::AppError};

#[derive(Debug, Deserialize)]
struct ProjectResponse {
    user_id: Uuid,
}

pub async fn ensure_mission_in_project(
    state: &AppState,
    project_id: Uuid,
    mission_id: Uuid,
) -> Result<(), AppError> {
    let response = state
        .http_client
        .get(format!(
            "{}/projects/{project_id}/missions/{mission_id}",
            state.config.project_service_url.trim_end_matches('/')
        ))
        .send()
        .await?;

    match response.status() {
        StatusCode::OK => Ok(()),
        StatusCode::NOT_FOUND => Err(AppError::NotFound(
            "Mission not found in this project".to_string(),
        )),
        status => Err(AppError::internal(format!(
            "Project service returned unexpected status while validating mission: {status}"
        ))),
    }
}

pub async fn fetch_project_owner_id(state: &AppState, project_id: Uuid) -> Result<Uuid, AppError> {
    let response = state
        .http_client
        .get(format!(
            "{}/projects/{project_id}",
            state.config.project_service_url.trim_end_matches('/')
        ))
        .send()
        .await?;

    match response.status() {
        StatusCode::OK => Ok(response.json::<ProjectResponse>().await?.user_id),
        StatusCode::NOT_FOUND => Err(AppError::NotFound("Project not found".to_string())),
        status => Err(AppError::internal(format!(
            "Project service returned unexpected status while fetching project: {status}"
        ))),
    }
}
