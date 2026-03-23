FROM rust:1.91-bookworm AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY gateway ./gateway
COPY user-service ./user-service
COPY project-service ./project-service
COPY observation-service ./observation-service

RUN cargo build --release -p project-service

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/project-service /usr/local/bin/project-service
CMD ["project-service"]
