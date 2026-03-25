FROM rust:1.91-bookworm AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY gateway/Cargo.toml gateway/Cargo.toml
COPY user-service/Cargo.toml user-service/Cargo.toml
COPY project-service/Cargo.toml project-service/Cargo.toml
COPY observation-service/Cargo.toml observation-service/Cargo.toml

RUN mkdir -p gateway/src user-service/src project-service/src observation-service/src \
    && printf 'fn main() {}\n' > gateway/src/main.rs \
    && printf 'fn main() {}\n' > user-service/src/main.rs \
    && printf 'fn main() {}\n' > project-service/src/main.rs \
    && printf 'fn main() {}\n' > observation-service/src/main.rs \
    && mkdir -p /out

RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry,sharing=locked \
    --mount=type=cache,id=cargo-git-db,target=/usr/local/cargo/git/db,sharing=locked \
    --mount=type=cache,id=target-observation-service-deps,target=/app/target,sharing=locked \
    cargo check --locked --release -p observation-service

COPY observation-service/src observation-service/src
COPY observation-service/migrations observation-service/migrations

RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry,sharing=locked \
    --mount=type=cache,id=cargo-git-db,target=/usr/local/cargo/git/db,sharing=locked \
    --mount=type=cache,id=target-observation-service-release,target=/app/target,sharing=locked \
    cargo build --locked --release -p observation-service \
    && cp /app/target/release/observation-service /out/observation-service

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /out/observation-service /usr/local/bin/observation-service
CMD ["observation-service"]
