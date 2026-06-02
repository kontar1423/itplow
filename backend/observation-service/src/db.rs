use sqlx::{PgPool, postgres::PgPoolOptions};

use crate::errors::AppError;

pub async fn create_pool(database_url: &str) -> Result<PgPool, AppError> {
    Ok(PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await?)
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), AppError> {
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}
