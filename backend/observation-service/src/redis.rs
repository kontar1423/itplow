use redis::AsyncCommands;

use crate::{AppState, errors::AppError};

pub fn session_key(token: &str) -> String {
    format!("session:{token}")
}

pub async fn session_user_id(state: &AppState, token: &str) -> Result<Option<String>, AppError> {
    let mut conn = state.redis.get_multiplexed_async_connection().await?;
    let user_id = conn.get(session_key(token)).await?;
    Ok(user_id)
}
