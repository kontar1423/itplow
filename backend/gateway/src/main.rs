mod config;
mod errors;

use std::io;

use ::redis::{AsyncCommands, Client};
use actix_cors::Cors;
use actix_web::{
    App, HttpRequest, HttpResponse, HttpServer,
    http::{Method, StatusCode, header},
    middleware::Logger,
    web,
};
use bytes::Bytes;
use chrono::Utc;
use config::Config;
use env_logger::Env;
use errors::AppError;
use jsonwebtoken::{DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};

const MAX_REQUEST_SIZE: usize = 20 * 1024 * 1024;

#[derive(Clone)]
struct AppState {
    config: Config,
    redis: Client,
    client: reqwest::Client,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[derive(Debug, Clone, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::Builder::from_env(Env::default().default_filter_or("info"))
        .format_timestamp_millis()
        .init();

    let config = Config::from_env().map_err(to_io_error)?;
    let redis = Client::open(config.redis_url.clone())
        .map_err(AppError::from)
        .map_err(to_io_error)?;
    let client = reqwest::Client::new();

    let state = web::Data::new(AppState {
        config: config.clone(),
        redis,
        client,
    });

    log::info!(
        "starting gateway on {}:{}",
        config.app_host,
        config.app_port
    );
    log::info!("allowed cors origins: {:?}", config.cors_allowed_origins);

    HttpServer::new(move || {
        let allowed_origins = config.cors_allowed_origins.clone();
        let cors = Cors::default()
            .allowed_origin_fn(move |origin, _req_head| {
                origin
                    .to_str()
                    .map(|origin| allowed_origins.iter().any(|allowed| allowed == origin))
                    .unwrap_or(false)
            })
            .allowed_methods(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
            .allowed_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(state.clone())
            .app_data(web::PayloadConfig::new(MAX_REQUEST_SIZE))
            .route("/health", web::get().to(health))
            .default_service(web::to(proxy))
    })
    .bind((config.app_host.clone(), config.app_port))?
    .run()
    .await
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok",
        service: "gateway",
    })
}

async fn proxy(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: Bytes,
) -> Result<HttpResponse, AppError> {
    let path = req.uri().path().to_string();
    let query = req
        .uri()
        .query()
        .map(|value| format!("?{value}"))
        .unwrap_or_default();

    if !path.starts_with("/api/") {
        return Err(AppError::NotFound("Gateway route not found".to_string()));
    }

    // Let Actix CORS finalize the response headers for browser preflight
    // without forcing auth or forwarding OPTIONS downstream.
    if req.method() == Method::OPTIONS {
        return Ok(HttpResponse::Ok().finish());
    }

    let auth_context = if is_public_route(req.method(), &path) {
        None
    } else {
        Some(validate_token(&state, &req).await?)
    };

    let target = resolve_target(&state.config, &path)?;
    let stripped_path = path
        .strip_prefix("/api")
        .ok_or_else(|| AppError::BadRequest("Path must start with /api".to_string()))?;
    let url = format!("{}{}{}", target.trim_end_matches('/'), stripped_path, query);

    let method = reqwest::Method::from_bytes(req.method().as_str().as_bytes())
        .map_err(|_| AppError::BadRequest("Unsupported HTTP method".to_string()))?;
    let mut builder = state.client.request(method, url).body(body.clone());

    for (name, value) in req.headers() {
        if name == header::HOST {
            continue;
        }
        builder = builder.header(name.as_str(), value.as_bytes());
    }

    if let Some(auth_context) = auth_context {
        builder = builder
            .header("X-User-Id", auth_context.sub)
            .header("X-User-Role", auth_context.role);
    }

    let response = builder.send().await?;
    let status = StatusCode::from_u16(response.status().as_u16())
        .map_err(|_| AppError::internal("Downstream service returned invalid status"))?;
    let headers = response.headers().clone();
    let bytes = response.bytes().await?;

    let mut client_response = HttpResponse::build(status);
    for (name, value) in headers {
        if let Some(name) = name {
            if should_skip_response_header(name.as_str()) {
                continue;
            }
            if let Ok(header_name) = header::HeaderName::try_from(name.as_str()) {
                if let Ok(header_value) = header::HeaderValue::from_bytes(value.as_bytes()) {
                    client_response.insert_header((header_name, header_value));
                }
            }
        }
    }

    Ok(client_response.body(bytes))
}

fn is_public_route(method: &Method, path: &str) -> bool {
    (method == Method::POST && path == "/api/users")
        || (method == Method::POST && path == "/api/auth/login")
        || path == "/health"
}

fn resolve_target<'a>(config: &'a Config, path: &str) -> Result<&'a str, AppError> {
    if path.starts_with("/api/users")
        || path.starts_with("/api/auth")
        || path.starts_with("/api/participations")
    {
        return Ok(&config.user_service_url);
    }
    if path.starts_with("/api/projects/") && path.contains("/observations") {
        return Ok(&config.observation_service_url);
    }
    if path.starts_with("/api/projects") {
        return Ok(&config.project_service_url);
    }
    Err(AppError::NotFound(
        "No target service for requested path".to_string(),
    ))
}

fn should_skip_response_header(name: &str) -> bool {
    matches!(
        name.to_ascii_lowercase().as_str(),
        "content-length" | "transfer-encoding" | "connection"
    )
}

async fn validate_token(state: &AppState, req: &HttpRequest) -> Result<Claims, AppError> {
    let header_value = req
        .headers()
        .get(header::AUTHORIZATION)
        .ok_or_else(|| AppError::Unauthorized("Authorization header is missing".to_string()))?;
    let header_value = header_value
        .to_str()
        .map_err(|_| AppError::Unauthorized("Authorization header is invalid".to_string()))?;
    let token = header_value
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::Unauthorized("Bearer token is missing".to_string()))?;

    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &Validation::default(),
    )?
    .claims;

    if claims.exp <= Utc::now().timestamp() as usize {
        return Err(AppError::Unauthorized("Token has expired".to_string()));
    }

    let mut conn = state.redis.get_multiplexed_async_connection().await?;
    let stored_user_id: Option<String> = conn.get(format!("session:{token}")).await?;
    match stored_user_id {
        Some(user_id) if user_id == claims.sub => Ok(claims),
        _ => Err(AppError::Unauthorized("Session was not found".to_string())),
    }
}

fn to_io_error(err: AppError) -> io::Error {
    io::Error::other(err.to_string())
}
