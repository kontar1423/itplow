use redis::AsyncCommands;
use serde::Serialize;

use crate::{AppState, errors::AppError};

pub fn session_key(token: &str) -> String {
    format!("session:{token}")
}

pub async fn store_session(state: &AppState, token: &str, user_id: &str) -> Result<(), AppError> {
    let mut conn = state.redis.get_multiplexed_async_connection().await?;
    let key = session_key(token);
    redis::pipe()
        .set(&key, user_id)
        .expire(&key, state.config.jwt_ttl_seconds)
        .query_async::<()>(&mut conn)
        .await?;
    Ok(())
}

pub async fn delete_session(state: &AppState, token: &str) -> Result<(), AppError> {
    let mut conn = state.redis.get_multiplexed_async_connection().await?;
    let _: usize = conn.del(session_key(token)).await?;
    Ok(())
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
