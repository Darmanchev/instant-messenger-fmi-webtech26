# Instant Messenger

A small real-time messenger I built for the FMI Web Technologies course. I wanted to go beyond a basic CRUD project, so I added live chat rooms, authentication and message history in one full-stack application.

## What works

- registration and login with JWT tokens;
- channel creation and deletion;
- real-time messages over WebSockets;
- message history, search and deletion;
- responsive React interface;
- PostgreSQL persistence and optional development seed data.

## Why I chose this stack

I used **FastAPI** because its async model works well for both REST endpoints and WebSockets. **React** made it easier to separate the chat, channel list and forms into small components. I chose **PostgreSQL + SQLAlchemy** because users, channels and messages have clear relations and should survive server restarts. Docker keeps the local setup reproducible.

The hardest part was keeping REST authentication and WebSocket authentication consistent. A WebSocket connection does not use the normal `Authorization` header flow from my fetch requests, so the client passes the JWT during the handshake and the backend validates it before accepting the connection. Switching channels also required closing the previous socket to avoid duplicate messages.

## Stack

- Python 3.12, FastAPI, SQLAlchemy 2, asyncpg
- React 19, Vite, Bootstrap
- PostgreSQL 17
- JWT, WebSockets
- Poetry, Docker Compose

## Run with Docker

Requirements: Docker with Compose, Node.js 22+ and npm.

```bash
git clone https://github.com/Darmanchev/instant-messenger-fmi-webtech26.git
cd instant-messenger-fmi-webtech26
cp .env.example .env
openssl rand -hex 24  # generate POSTGRES_PASSWORD
openssl rand -hex 32  # generate SECRET_KEY
```

Put the generated values in `.env`, then run:

```bash
make all
```

Open [http://localhost:8088](http://localhost:8088). `make all` builds the React app, starts PostgreSQL and starts the FastAPI container.

To add demo users and channels locally, run the seed explicitly:

```bash
make seed
```

The seed is never run during application startup and refuses to run when
`ENVIRONMENT=production`.

Useful commands:

```bash
make logs       # backend logs
make shell      # shell inside the backend container
make all-down   # stop the application and database
```

## Run in development mode

Start PostgreSQL and the backend:

```bash
cp .env.example .env
openssl rand -hex 24  # generate POSTGRES_PASSWORD
openssl rand -hex 32  # generate SECRET_KEY
```

Put the generated values in `.env`. For a backend running on the host, set:

```dotenv
DATABASE_URL=postgresql+asyncpg://instantmessenger:<POSTGRES_PASSWORD>@127.0.0.1:5433/instantmessenger
```

Then start the services:

```bash
make storages
poetry install
poetry run uvicorn backend.main:app --reload --port 8088 --ws-max-size 2048
```

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Vite proxies API and WebSocket traffic to port `8088`.

`make storages` binds PostgreSQL only to `127.0.0.1:5433`. `make all` does not
publish the database port at all.

## Security configuration

- Every channel and message REST endpoint requires a valid JWT.
- `SECRET_KEY` must be generated from at least 32 random bytes. The application
  refuses short and known placeholder values.
- WebSocket payloads are validated, limited to 255 characters and 2048 bytes per
  frame, and rate-limited. Connections are limited per user and source IP.
- WebSocket limits are process-local. A multi-instance deployment should use a
  shared limiter and pub/sub layer such as Redis at the reverse proxy or
  application boundary.
- In production, set `ENVIRONMENT=production` and keep `SECRET_KEY`,
  `DATABASE_URL`, and database credentials in the hosting provider's secret
  storage. Do not commit a populated `.env`.
- Production PostgreSQL should be available only over a private network (or be a
  managed service), require TLS, use a separate long random password, and have
  automated backups with restore tests.

## Project structure

```text
backend/api/       REST and WebSocket endpoints
backend/core/      authentication, passwords and socket manager
backend/models/    SQLAlchemy models
backend/schemas/   request and response schemas
frontend/src/      React pages and components
docker_compose/    app and PostgreSQL services
```

## Current status and next steps

This is a working course-project version. The next things I would add are database migrations, channel membership and permissions, message editing, reconnect/error handling for WebSockets and stricter production CORS settings.
