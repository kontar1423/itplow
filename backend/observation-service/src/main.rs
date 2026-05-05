mod config;
mod db;
mod errors;
mod handlers;
mod middleware;
mod project_client;
mod redis;
mod storage;

use std::io;

use ::redis::Client;
use actix_web::{App, HttpResponse, HttpServer, middleware::Logger, web};
use config::Config;
use db::{create_pool, run_migrations};
use env_logger::Env;
use errors::AppError;
use serde::Serialize;
use sqlx::PgPool;
use storage::Storage;

const MAX_UPLOAD_SIZE: usize = 20 * 1024 * 1024;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub db: PgPool,
    pub redis: Client,
    pub storage: Storage,
    pub http_client: reqwest::Client,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::Builder::from_env(Env::default().default_filter_or("info"))
        .format_timestamp_millis()
        .init();

    let config = Config::from_env().map_err(to_io_error)?;
    let db = create_pool(&config.database_url)
        .await
        .map_err(to_io_error)?;
    run_migrations(&db).await.map_err(to_io_error)?;
    let redis = Client::open(config.redis_url.clone())
        .map_err(AppError::from)
        .map_err(to_io_error)?;
    let storage = Storage::from_config(&config).await.map_err(to_io_error)?;
    let http_client = reqwest::Client::new();

    let state = web::Data::new(AppState {
        config: config.clone(),
        db,
        redis,
        storage,
        http_client,
    });

    log::info!(
        "starting observation-service on {}:{}",
        config.app_host,
        config.app_port
    );

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(state.clone())
            .app_data(web::PayloadConfig::new(MAX_UPLOAD_SIZE))
            .route("/health", web::get().to(health))
            .service(
                web::scope("/projects/{project_id}/missions/{mission_id}/observations")
                    .route("", web::get().to(handlers::observations::list_observations))
                    .route(
                        "",
                        web::post().to(handlers::observations::create_observation),
                    )
                    .route(
                        "/{obs_id}",
                        web::get().to(handlers::observations::get_observation),
                    )
                    .route(
                        "/{obs_id}",
                        web::put().to(handlers::observations::update_observation),
                    )
                    .route(
                        "/{obs_id}",
                        web::patch().to(handlers::observations::update_observation),
                    )
                    .route(
                        "/{obs_id}",
                        web::delete().to(handlers::observations::delete_observation),
                    )
                    .route(
                        "/{obs_id}/files",
                        web::get().to(handlers::files::list_files),
                    )
                    .route(
                        "/{obs_id}/files",
                        web::post().to(handlers::files::upload_file),
                    )
                    .service(
                        web::scope("/{obs_id}/comments")
                            .route("", web::get().to(handlers::comments::list_comments))
                            .route("", web::post().to(handlers::comments::create_comment))
                            .route(
                                "/{comment_id}",
                                web::get().to(handlers::comments::get_comment),
                            )
                            .route(
                                "/{comment_id}",
                                web::put().to(handlers::comments::update_comment),
                            )
                            .route(
                                "/{comment_id}",
                                web::patch().to(handlers::comments::update_comment),
                            )
                            .route(
                                "/{comment_id}",
                                web::delete().to(handlers::comments::delete_comment),
                            ),
                    ),
            )
            .default_service(web::route().to(not_found))
    })
    .bind((config.app_host.clone(), config.app_port))?
    .run()
    .await
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok",
        service: "observation-service",
    })
}

async fn not_found() -> Result<HttpResponse, AppError> {
    Err(AppError::NotFound("Route not found".to_string()))
}

fn to_io_error(err: AppError) -> io::Error {
    io::Error::other(err.to_string())
}
