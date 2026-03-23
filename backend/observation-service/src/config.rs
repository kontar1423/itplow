use std::env;

use crate::errors::AppError;

#[derive(Clone, Debug)]
pub struct Config {
    pub app_host: String,
    pub app_port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub project_service_url: String,
    pub minio_endpoint: String,
    pub minio_region: String,
    pub minio_access_key: String,
    pub minio_secret_key: String,
    pub minio_bucket: String,
}

impl Config {
    pub fn from_env() -> Result<Self, AppError> {
        Ok(Self {
            app_host: env::var("APP_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            app_port: env::var("APP_PORT")
                .unwrap_or_else(|_| "8083".to_string())
                .parse()
                .map_err(|_| AppError::Config("APP_PORT must be a valid u16".to_string()))?,
            database_url: env::var("DATABASE_URL")
                .map_err(|_| AppError::Config("DATABASE_URL is required".to_string()))?,
            redis_url: env::var("REDIS_URL")
                .map_err(|_| AppError::Config("REDIS_URL is required".to_string()))?,
            jwt_secret: env::var("JWT_SECRET")
                .map_err(|_| AppError::Config("JWT_SECRET is required".to_string()))?,
            project_service_url: env::var("PROJECT_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8082".to_string()),
            minio_endpoint: env::var("MINIO_ENDPOINT")
                .map_err(|_| AppError::Config("MINIO_ENDPOINT is required".to_string()))?,
            minio_region: env::var("MINIO_REGION").unwrap_or_else(|_| "us-east-1".to_string()),
            minio_access_key: env::var("MINIO_ACCESS_KEY")
                .map_err(|_| AppError::Config("MINIO_ACCESS_KEY is required".to_string()))?,
            minio_secret_key: env::var("MINIO_SECRET_KEY")
                .map_err(|_| AppError::Config("MINIO_SECRET_KEY is required".to_string()))?,
            minio_bucket: env::var("MINIO_BUCKET").unwrap_or_else(|_| "observations".to_string()),
        })
    }
}
