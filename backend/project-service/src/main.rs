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
use errors::AppError;
use serde::Serialize;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub db: PgPool,
    pub redis: Client,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init();

    let config = Config::from_env().map_err(to_io_error)?;
    let db = create_pool(&config.database_url)
        .await
        .map_err(to_io_error)?;
    run_migrations(&db).await.map_err(to_io_error)?;
    let redis = Client::open(config.redis_url.clone())
        .map_err(AppError::from)
        .map_err(to_io_error)?;

    let state = web::Data::new(AppState {
        config: config.clone(),
        db,
        redis,
    });

    log::info!(
        "starting project-service on {}:{}",
        config.app_host,
        config.app_port
    );

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(state.clone())
            .route("/health", web::get().to(health))
            .service(
                web::scope("/projects")
                    .route("", web::get().to(handlers::projects::list_projects))
                    .route("", web::post().to(handlers::projects::create_project))
                    .route("/by_tags", web::get().to(handlers::projects::by_tags))
                    .route("/{id}", web::get().to(handlers::projects::get_project))
                    .route("/{id}", web::put().to(handlers::projects::update_project))
                    .route(
                        "/{id}",
                        web::delete().to(handlers::projects::delete_project),
                    )
                    .service(
                        web::scope("/{project_id}/missions")
                            .route("", web::get().to(handlers::missions::list_missions))
                            .route("", web::post().to(handlers::missions::create_mission))
                            .route(
                                "/{mission_id}",
                                web::get().to(handlers::missions::get_mission),
                            )
                            .route(
                                "/{mission_id}",
                                web::put().to(handlers::missions::update_mission),
                            )
                            .route(
                                "/{mission_id}",
                                web::delete().to(handlers::missions::delete_mission),
                            ),
                    ),
            )
            .service(web::scope("/internal").route(
                "/users/{user_id}/projects",
                web::get().to(handlers::projects::user_projects),
            ))
            .default_service(web::route().to(not_found))
    })
    .bind((config.app_host.clone(), config.app_port))?
    .run()
    .await
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok",
        service: "project-service",
    })
}

async fn not_found() -> Result<HttpResponse, AppError> {
    Err(AppError::NotFound("Route not found".to_string()))
}

fn to_io_error(err: AppError) -> io::Error {
    io::Error::other(err.to_string())
}
