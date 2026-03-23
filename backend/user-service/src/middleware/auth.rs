use std::{future::Future, pin::Pin};

use actix_web::{FromRequest, HttpRequest, dev::Payload, http::header, web};
use chrono::Utc;
use jsonwebtoken::{DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{AppState, errors::AppError, redis::session_user_id};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub user_id: Uuid,
    pub role: String,
    pub token: String,
}

impl AuthenticatedUser {
    pub fn is_admin(&self) -> bool {
        self.role == "admin"
    }
}

impl FromRequest for AuthenticatedUser {
    type Error = actix_web::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let state = req.app_data::<web::Data<AppState>>().cloned();
        let auth_header = req.headers().get(header::AUTHORIZATION).cloned();

        Box::pin(async move {
            let state = state.ok_or_else(|| AppError::internal("App state is missing"))?;
            let header_value = auth_header.ok_or_else(|| {
                AppError::Unauthorized("Authorization header is missing".to_string())
            })?;
            let header_value = header_value.to_str().map_err(|_| {
                AppError::Unauthorized("Authorization header is invalid".to_string())
            })?;
            let token = header_value
                .strip_prefix("Bearer ")
                .ok_or_else(|| AppError::Unauthorized("Bearer token is missing".to_string()))?
                .to_string();

            let claims = decode_token(&token, &state.config.jwt_secret)?;
            if claims.exp <= Utc::now().timestamp() as usize {
                return Err(AppError::Unauthorized("Token has expired".to_string()).into());
            }

            let stored_user = session_user_id(state.get_ref(), &token).await?;
            let user_id = stored_user
                .ok_or_else(|| AppError::Unauthorized("Session was not found".to_string()))?;

            if user_id != claims.sub {
                return Err(
                    AppError::Unauthorized("Session does not match token".to_string()).into(),
                );
            }

            Ok(Self {
                user_id: Uuid::parse_str(&claims.sub).map_err(AppError::from)?,
                role: claims.role,
                token,
            })
        })
    }
}

pub fn decode_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;
    Ok(token_data.claims)
}
