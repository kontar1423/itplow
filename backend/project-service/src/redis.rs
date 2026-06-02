use redis::AsyncCommands;
use serde::Serialize;

use crate::{AppState, errors::AppError};

pub fn session_key(token: &str) -> String {
    format!("session:{token}")
}

pub async fn session_user_id(state: &AppState, token: &str) -> Result<Option<String>, AppError> {
    let mut conn = state.redis.get_multiplexed_async_connection().await?;
    let user_id = conn.get(session_key(token)).await?;
    Ok(user_id)
}

pub async fn publish_event<T>(state: &AppState, channel: &str, payload: &T) -> Result<(), AppError>
where
    T: Serialize,
{
    let mut conn = state.redis.get_multiplexed_async_connection().await?;
    let message = serde_json::to_string(payload)?;
    let _: usize = conn.publish(channel, message).await?;
    Ok(())
}
