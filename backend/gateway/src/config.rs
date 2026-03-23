use std::env;

use crate::errors::AppError;

#[derive(Clone, Debug)]
pub struct Config {
    pub app_host: String,
    pub app_port: u16,
    pub cors_allowed_origin: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub user_service_url: String,
    pub project_service_url: String,
    pub observation_service_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, AppError> {
        Ok(Self {
            app_host: env::var("APP_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            app_port: env::var("APP_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .map_err(|_| AppError::Config("APP_PORT must be a valid u16".to_string()))?,
            cors_allowed_origin: env::var("CORS_ALLOWED_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            redis_url: env::var("REDIS_URL")
                .map_err(|_| AppError::Config("REDIS_URL is required".to_string()))?,
            jwt_secret: env::var("JWT_SECRET")
                .map_err(|_| AppError::Config("JWT_SECRET is required".to_string()))?,
            user_service_url: env::var("USER_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8081".to_string()),
            project_service_url: env::var("PROJECT_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8082".to_string()),
            observation_service_url: env::var("OBSERVATION_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8083".to_string()),
        })
    }
}
