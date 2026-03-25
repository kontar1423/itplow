mod config;
mod db;
mod errors;
mod handlers;
mod middleware;
mod redis;

use std::io;

use ::redis::Client;
use actix_web::{App, HttpResponse, HttpServer, middleware::Logger, web};
use config::Config;
use db::{create_pool, run_migrations};
use env_logger::Env;
use errors::AppError;
use serde::Serialize;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub db: PgPool,
    pub redis: Client,
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
    let http_client = reqwest::Client::new();

    let state = web::Data::new(AppState {
        config: config.clone(),
        db,
        redis,
        http_client,
    });

    log::info!(
        "starting user-service on {}:{}",
        config.app_host,
        config.app_port
    );

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(state.clone())
            .route("/health", web::get().to(health))
            .service(
                web::scope("/users")
                    .route("", web::post().to(handlers::users::register))
                    .route("/me", web::get().to(handlers::users::me))
                    .route("/me", web::put().to(handlers::users::update_me))
                    .route("/me", web::patch().to(handlers::users::update_me))
                    .route("/{id}", web::get().to(handlers::users::public_profile))
                    .route(
                        "/{id}/projects",
                        web::get().to(handlers::users::user_projects),
                    ),
            )
            .service(
                web::scope("/auth")
                    .route("/login", web::post().to(handlers::users::login))
                    .route("/logout", web::post().to(handlers::users::logout)),
            )
            .service(
                web::scope("/participations")
                    .route(
                        "/{project_id}",
                        web::get().to(handlers::participations::list_participants),
                    )
                    .route(
                        "/{project_id}",
                        web::post().to(handlers::participations::join_project),
                    )
                    .route(
                        "/{project_id}/{user_id}",
                        web::delete().to(handlers::participations::leave_project),
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
        service: "user-service",
    })
}

async fn not_found() -> Result<HttpResponse, AppError> {
    Err(AppError::NotFound("Route not found".to_string()))
}

fn to_io_error(err: AppError) -> io::Error {
    io::Error::other(err.to_string())
}
