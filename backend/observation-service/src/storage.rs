use std::time::Duration;

use aws_sdk_s3::{
    Client,
    config::{Builder, Credentials, Region},
    presigning::PresigningConfig,
    primitives::ByteStream,
};
use bytes::Bytes;
use uuid::Uuid;

use crate::{config::Config, errors::AppError};

#[derive(Clone)]
pub struct Storage {
    pub client: Client,
    pub bucket: String,
    pub endpoint: String,
}

impl Storage {
    pub async fn from_config(config: &Config) -> Result<Self, AppError> {
        let s3_config = Builder::new()
            .region(Region::new(config.minio_region.clone()))
            .endpoint_url(config.minio_endpoint.clone())
            .credentials_provider(Credentials::new(
                config.minio_access_key.clone(),
                config.minio_secret_key.clone(),
                None,
                None,
                "static",
            ))
            .force_path_style(true)
            .behavior_version_latest()
            .build();

        let client = Client::from_conf(s3_config);
        let storage = Self {
            client,
            bucket: config.minio_bucket.clone(),
            endpoint: config.minio_endpoint.trim_end_matches('/').to_string(),
        };
        storage.ensure_bucket().await?;
        Ok(storage)
    }

    async fn ensure_bucket(&self) -> Result<(), AppError> {
        let exists = self.client.head_bucket().bucket(&self.bucket).send().await;
        if exists.is_ok() {
            return Ok(());
        }

        self.client
            .create_bucket()
            .bucket(&self.bucket)
            .send()
            .await
            .map_err(|err| AppError::internal(format!("Failed to create bucket: {err}")))?;
        Ok(())
    }

    pub async fn upload(
        &self,
        observation_id: Uuid,
        title: &str,
        bytes: Bytes,
        content_type: &str,
    ) -> Result<(String, String), AppError> {
        let safe_title: String = title
            .chars()
            .map(|c| {
                if c.is_alphanumeric() || matches!(c, '-' | '_' | '.') {
                    c
                } else {
                    '_'
                }
            })
            .collect();
        let key = format!("{observation_id}/{}-{safe_title}", Uuid::new_v4());
        let body = ByteStream::from(bytes);

        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(body)
            .content_type(content_type)
            .send()
            .await
            .map_err(|err| AppError::internal(format!("Failed to upload file to MinIO: {err}")))?;

        Ok((
            key.clone(),
            format!("{}/{}/{}", self.endpoint, self.bucket, key),
        ))
    }

    pub async fn presigned_url(&self, key: &str) -> Result<String, AppError> {
        let request = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .presigned(
                PresigningConfig::expires_in(Duration::from_secs(3600)).map_err(|err| {
                    AppError::internal(format!("Failed to build presigned config: {err}"))
                })?,
            )
            .await
            .map_err(|err| AppError::internal(format!("Failed to presign URL: {err}")))?;

        Ok(request.uri().to_string())
    }
}
