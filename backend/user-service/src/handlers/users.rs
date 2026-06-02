use actix_web::{HttpResponse, web};
use bcrypt::{DEFAULT_COST, hash, verify};
use chrono::{Duration, Utc};
use jsonwebtoken::{EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    middleware::auth::{AuthenticatedUser, Claims},
    redis::{delete_session, publish_event, store_session},
};

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub email: String,
    pub password: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub phone: Option<String>,
    pub role: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginDto {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMeDto {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub phone: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, FromRow, Clone)]
pub struct UserRecord {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub phone: Option<String>,
    pub role: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub phone: Option<String>,
    pub role: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
struct UserCreatedEvent {
    id: Uuid,
    email: String,
    role: String,
}

pub async fn register(
    state: web::Data<AppState>,
    payload: web::Json<CreateUserDto>,
) -> Result<HttpResponse, AppError> {
    if payload.password.len() < 6 {
        return Err(AppError::BadRequest(
            "Password must contain at least 6 characters".to_string(),
        ));
    }
    if payload.password.len() > 72 {
        return Err(AppError::BadRequest(
            "Password must not exceed 72 characters".to_string(),
        ));
    }

    let role = payload
        .role
        .clone()
        .unwrap_or_else(|| "volunteer".to_string());
    if role != "volunteer" && role != "scientist" {
        return Err(AppError::BadRequest(
            "Public registration supports only: volunteer, scientist".to_string(),
        ));
    }

    let password_hash = hash(&payload.password, DEFAULT_COST)?;

    let user = sqlx::query_as::<_, UserRecord>(
        r#"
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, password_hash, first_name, last_name, phone, role, description, created_at
        "#,
    )
    .bind(payload.email.trim().to_lowercase())
    .bind(password_hash)
    .bind(payload.first_name.as_deref())
    .bind(payload.last_name.as_deref())
    .bind(payload.phone.as_deref())
    .bind(role.clone())
    .bind(payload.description.as_deref())
    .fetch_one(&state.db)
    .await
    .map_err(map_constraint_error)?;

    if let Err(err) = publish_event(
        state.get_ref(),
        "user.created",
        &UserCreatedEvent {
            id: user.id,
            email: user.email.clone(),
            role: role.clone(),
        },
    )
    .await
    {
        log::warn!("failed to publish user.created for {}: {}", user.id, err);
    }

    log::info!(
        "user registered: id={}, email={}, role={}",
        user.id,
        user.email,
        role
    );

    Ok(HttpResponse::Created().json(to_user_response(user)))
}

pub async fn login(
    state: web::Data<AppState>,
    payload: web::Json<LoginDto>,
) -> Result<HttpResponse, AppError> {
    let user = sqlx::query_as::<_, UserRecord>(
        r#"
        SELECT id, email, password_hash, first_name, last_name, phone, role, description, created_at
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(payload.email.trim().to_lowercase())
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    if !verify(&payload.password, &user.password_hash)? {
        return Err(AppError::Unauthorized(
            "Invalid email or password".to_string(),
        ));
    }

    let exp = (Utc::now() + Duration::seconds(state.config.jwt_ttl_seconds)).timestamp() as usize;
    let claims = Claims {
        sub: user.id.to_string(),
        role: user.role.clone(),
        exp,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.config.jwt_secret.as_bytes()),
    )?;

    store_session(state.get_ref(), &token, &user.id.to_string()).await?;

    log::info!("user logged in: id={}, email={}", user.id, user.email);

    Ok(HttpResponse::Ok().json(AuthResponse {
        token,
        user: to_user_response(user),
    }))
}

pub async fn logout(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    delete_session(state.get_ref(), &auth.token).await?;
    log::info!("user logged out: id={}", auth.user_id);
    Ok(HttpResponse::Ok().finish())
}

pub async fn me(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let user = fetch_user(&state, auth.user_id).await?;
    Ok(HttpResponse::Ok().json(to_user_response(user)))
}

pub async fn update_me(
    state: web::Data<AppState>,
    auth: AuthenticatedUser,
    payload: web::Json<UpdateMeDto>,
) -> Result<HttpResponse, AppError> {
    let user = sqlx::query_as::<_, UserRecord>(
        r#"
        UPDATE users
        SET
            first_name = COALESCE($2, first_name),
            last_name = COALESCE($3, last_name),
            phone = COALESCE($4, phone),
            description = COALESCE($5, description)
        WHERE id = $1
        RETURNING id, email, password_hash, first_name, last_name, phone, role, description, created_at
        "#,
    )
    .bind(auth.user_id)
    .bind(payload.first_name.as_deref())
    .bind(payload.last_name.as_deref())
    .bind(payload.phone.as_deref())
    .bind(payload.description.as_deref())
    .fetch_one(&state.db)
    .await?;

    log::info!("profile updated: id={}", auth.user_id);

    Ok(HttpResponse::Ok().json(to_user_response(user)))
}

pub async fn public_profile(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let user = fetch_user(&state, path.into_inner()).await?;
    Ok(HttpResponse::Ok().json(to_user_response(user)))
}

pub async fn user_projects(
    state: web::Data<AppState>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let user_id = path.into_inner();
    let response = state
        .http_client
        .get(format!(
            "{}/internal/users/{user_id}/projects",
            state.config.project_service_url.trim_end_matches('/')
        ))
        .send()
        .await?;

    let status = response.status();
    let body = response.bytes().await?;

    Ok(HttpResponse::build(
        actix_web::http::StatusCode::from_u16(status.as_u16()).map_err(|_| {
            AppError::External("Project service returned invalid status".to_string())
        })?,
    )
    .body(body))
}

async fn fetch_user(state: &AppState, user_id: Uuid) -> Result<UserRecord, AppError> {
    sqlx::query_as::<_, UserRecord>(
        r#"
        SELECT id, email, password_hash, first_name, last_name, phone, role, description, created_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => AppError::NotFound("User not found".to_string()),
        other => AppError::Sqlx(other),
    })
}

fn to_user_response(user: UserRecord) -> UserResponse {
    UserResponse {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        description: user.description,
        created_at: user.created_at,
    }
}

fn map_constraint_error(err: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(db_err) = &err {
        if db_err.is_unique_violation() {
            return AppError::Conflict("User with this email already exists".to_string());
        }
    }
    AppError::Sqlx(err)
}
